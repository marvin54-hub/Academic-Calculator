import { Pool } from "pg";

let pool: Pool | null = null;

// Lazily created so this module can be imported before dotenv.config() has
// run (ES module imports execute before the importing file's own top-level
// code, including a dotenv.config() call listed after the import) without
// throwing prematurely on a DATABASE_URL that hasn't been loaded yet.
function getPool(): Pool {
  if (pool) return pool;

  // Works with Neon (via the Vercel Marketplace integration, which injects
  // DATABASE_URL / POSTGRES_URL), or any standard Postgres connection
  // string for local development or other hosts.
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (or POSTGRES_URL) is not set. Add a Postgres connection string to your environment " +
        "(see .env.example)."
    );
  }

  // Neon (and most managed Postgres providers) require SSL. Local Postgres
  // typically doesn't support/need it, so only enable it for non-localhost
  // connections. We control this explicitly via the `ssl` option below
  // rather than relying on a `sslmode=...` query param in the connection
  // string, since having both makes `pg` emit a confusing warning about
  // conflicting SSL configuration on every startup.
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  const normalizedConnectionString = connectionString.replace(/([?&])sslmode=[^&]*&?/i, "$1").replace(/[?&]$/, "");

  pool = new Pool({
    connectionString: normalizedConnectionString,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });
  return pool;
}

let schemaReady: Promise<void> | null = null;

// Serverless functions can run cold on every invocation, so schema setup
// runs lazily on first use rather than at module load, and is memoized so
// concurrent requests on a warm instance don't repeat it.
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool().query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        modules JSONB NOT NULL,
        history JSONB NOT NULL,
        settings JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS password_resets (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL
      );
    `).then(() => undefined);
  }
  return schemaReady;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  created_at: string;
}

export interface UserDataRow {
  user_id: string;
  modules: unknown;
  history: unknown;
  settings: unknown;
  updated_at: string;
}

export const userStore = {
  async findByEmail(email: string): Promise<UserRow | undefined> {
    await ensureSchema();
    const { rows } = await getPool().query<UserRow>("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase().trim(),
    ]);
    return rows[0];
  },

  async findById(id: string): Promise<UserRow | undefined> {
    await ensureSchema();
    const { rows } = await getPool().query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0];
  },

  async create(user: { id: string; email: string; passwordHash: string; displayName: string }): Promise<UserRow> {
    await ensureSchema();
    const { rows } = await getPool().query<UserRow>(
      `INSERT INTO users (id, email, password_hash, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.id, user.email.toLowerCase().trim(), user.passwordHash, user.displayName]
    );
    return rows[0];
  },

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await ensureSchema();
    await getPool().query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, userId]);
  },

  // user_data and password_resets rows are removed automatically via the
  // ON DELETE CASCADE foreign keys declared above (Postgres enforces these
  // by default, unlike SQLite).
  async delete(userId: string): Promise<void> {
    await ensureSchema();
    await getPool().query("DELETE FROM users WHERE id = $1", [userId]);
  },
};

export const dataStore = {
  async get(userId: string): Promise<UserDataRow | undefined> {
    await ensureSchema();
    const { rows } = await getPool().query<UserDataRow>("SELECT * FROM user_data WHERE user_id = $1", [userId]);
    return rows[0];
  },

  async upsert(userId: string, modules: unknown, history: unknown, settings: unknown): Promise<void> {
    await ensureSchema();
    await getPool().query(
      `INSERT INTO user_data (user_id, modules, history, settings, updated_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (user_id) DO UPDATE SET
         modules = EXCLUDED.modules,
         history = EXCLUDED.history,
         settings = EXCLUDED.settings,
         updated_at = EXCLUDED.updated_at`,
      [userId, JSON.stringify(modules), JSON.stringify(history), JSON.stringify(settings)]
    );
  },
};

export const passwordResetStore = {
  async create(tokenHash: string, userId: string, expiresAt: Date): Promise<void> {
    await ensureSchema();
    // Only one active reset per user at a time.
    await getPool().query("DELETE FROM password_resets WHERE user_id = $1", [userId]);
    await getPool().query(
      "INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
      [tokenHash, userId, expiresAt.toISOString()]
    );
  },

  async consume(tokenHash: string): Promise<{ userId: string } | null> {
    await ensureSchema();
    const { rows } = await getPool().query<{ token_hash: string; user_id: string; expires_at: string }>(
      "SELECT * FROM password_resets WHERE token_hash = $1",
      [tokenHash]
    );
    const row = rows[0];
    if (!row) return null;
    await getPool().query("DELETE FROM password_resets WHERE token_hash = $1", [tokenHash]);
    if (new Date(row.expires_at).getTime() < Date.now()) return null;
    return { userId: row.user_id };
  },
};
