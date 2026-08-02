<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Academic Calculator

Calculate grades, track course progress, predict outcomes, and get planning
help from an AI Academic Assistant.

## Accounts & data storage

- **Sign up / Sign in** creates a real account: passwords are hashed with
  bcrypt and stored in a Postgres database. Your modules, assessments,
  history, and settings are saved to that account and reloaded on any
  device you log into.
- **Guest mode** doesn't create an account. Its data lives only in your
  browser's local storage on that one device.
- **Forgot password** issues a real, single-use, 15-minute reset token. If
  you configure SMTP (see below), the link is emailed to you. If you don't,
  there's no email provider to send it through, so the API response returns
  the link directly instead of pretending to have emailed it — check your
  server logs or the on-screen dev link.

## Run Locally

**Prerequisites:** Node.js 18+, and a Postgres database (see below).

### 1. Get a Postgres database

Any Postgres works, but the easiest option — and the one that also works if
you deploy to Vercel — is a free [Neon](https://neon.tech) database:

1. Go to https://neon.tech, sign up, and create a project (this gives you
   a free Postgres database).
2. Copy the connection string it gives you (looks like
   `postgres://user:password@host/dbname?sslmode=require`).

Alternatively, run Postgres locally (e.g. via Docker:
`docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`) and use
`postgres://postgres:postgres@localhost:5432/postgres` instead.

The app creates its own tables automatically on first run — no migration
step needed.

### 2. Install and configure

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in:
   - `GEMINI_API_KEY` — your Gemini API key, used by the AI Academic
     Assistant (get one at https://aistudio.google.com/apikey)
   - `DATABASE_URL` — the Postgres connection string from step 1
   - `SESSION_SECRET` — a random secret used to sign login sessions
     (generate one with `openssl rand -hex 32`). Required in production;
     a throwaway one is used automatically in development.
   - `SMTP_*` (optional, but required for password reset **emails** to
     actually send — see below) — without these, reset links are returned
     directly by the API instead of being emailed.
3. Run the app:
   ```
   npm run dev
   ```

The app and its API run together on `http://localhost:3000`.

### Sending real password reset emails (SMTP setup)

Without SMTP configured, "Forgot password" still works — the reset link is
just returned in the API response / server logs instead of emailed. To have
it actually send an email, the easiest free option is a Gmail App Password:

1. Turn on 2-Step Verification on the Google account you want to send from:
   https://myaccount.google.com/security
2. Create an App Password: https://myaccount.google.com/apppasswords
   (choose "Mail" as the app). Google gives you a 16-character password.
3. In `.env.local`, set:
   ```
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="youraddress@gmail.com"
   SMTP_PASS="the-16-character-app-password"
   SMTP_FROM="Academic Calculator <youraddress@gmail.com>"
   ```
4. Restart the server (`npm run dev`). Password reset requests will now
   actually be emailed to the address on the account.

Any other SMTP provider (Outlook, a transactional email service like
Resend/SendGrid/Mailgun, your own mail server, etc.) works the same way —
just fill in that provider's host/port/user/password instead.

## In-app settings

The gear icon in the top-right corner opens:
- **About the App** — version and a short description
- **Privacy & Permissions** — what's stored, where, and what's sent to Gemini
- **Account & Security** (signed-in accounts only) — change password, sign
  out, and permanently delete your account and all its data
- **Notifications** toggle

## Deploying to Vercel

This repo is set up to deploy on Vercel as-is: the frontend builds as a
static site, and the API runs as a single serverless function
(`api/index.ts`).

1. Push this repo to GitHub (see below), then go to
   https://vercel.com/new and import it.
2. Add a Postgres database: in your new Vercel project, go to
   **Storage → Marketplace Database Providers**, and add **Neon** (or
   another Postgres provider). This automatically sets `DATABASE_URL` (or
   `POSTGRES_URL`) for you — you don't need to add it manually.
3. In **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY`
   - `SESSION_SECRET` (generate with `openssl rand -hex 32` — required, the
     app will refuse to start in production without it)
   - `APP_URL` — your Vercel deployment URL (e.g.
     `https://your-app.vercel.app`), used to build password reset links
   - `SMTP_*` (optional, for real reset emails — see above)
4. Deploy. Vercel builds the frontend automatically and the database tables
   are created automatically on first request.

**Note:** the SQLite-based local file storage this project used earlier was
replaced with Postgres specifically so it would work on Vercel — serverless
functions don't have a persistent local filesystem, so a database file
would be wiped between requests.

### Deploying elsewhere (Railway, Render, Fly.io, a VPS, etc.)

For any host that runs a normal long-lived Node process:
```
npm run build
npm start
```
This builds the frontend and bundles `server.ts` into `dist/server.cjs`,
which serves both the frontend and the API on one port. You still need the
same environment variables as above (`DATABASE_URL`, `GEMINI_API_KEY`,
`SESSION_SECRET`, etc.) set on whichever platform you use.

## License

MIT — see [LICENSE](LICENSE).
