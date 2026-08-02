import { Router } from "express";
import { userStore, dataStore, passwordResetStore } from "./database.js";
import {
  hashPassword,
  verifyPassword,
  isValidEmail,
  isValidPassword,
  issueSession,
  clearSession,
  requireAuth,
  getSessionUserId,
  generateResetToken,
  hashResetToken,
  newUserId,
  type AuthedRequest,
} from "./auth.js";
import { sendPasswordResetEmail } from "./mailer.js";

export const authRouter = Router();
export const dataRouter = Router();

function publicUser(user: { id: string; email: string; display_name: string }) {
  return { uid: user.id, email: user.email, displayName: user.display_name };
}

authRouter.post("/signup", async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (!isValidEmail(email || "")) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (!isValidPassword(password || "")) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "Please enter your name." });
  }
  if (await userStore.findByEmail(email)) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const passwordHash = await hashPassword(password);
  const user = await userStore.create({
    id: newUserId("u"),
    email,
    passwordHash,
    displayName: String(name).trim(),
  });

  issueSession(res, user.id);
  res.status(201).json({ user: publicUser(user) });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = await userStore.findByEmail(email || "");

  // Same error for unknown email and wrong password, so we don't leak
  // which accounts exist.
  if (!user || !(await verifyPassword(password || "", user.password_hash))) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  issueSession(res, user.id);
  res.json({ user: publicUser(user) });
});

authRouter.post("/logout", (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

authRouter.get("/me", async (req: AuthedRequest, res) => {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: "Not signed in." });
  const user = await userStore.findById(userId);
  if (!user) return res.status(401).json({ error: "Not signed in." });
  res.json({ user: publicUser(user) });
});

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body ?? {};
  const user = await userStore.findByEmail(email || "");

  // Always respond the same way whether or not the account exists, so
  // requesters can't use this endpoint to enumerate registered emails.
  const genericResponse = {
    message: "If an account exists for that email, a reset link has been sent.",
  };

  if (!user) return res.json(genericResponse);

  const { raw, hash } = generateResetToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await passwordResetStore.create(hash, user.id, expiresAt);

  const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
  const resetLink = `${appUrl.replace(/\/$/, "")}/?resetToken=${raw}`;

  const { delivered } = await sendPasswordResetEmail(user.email, resetLink);

  if (delivered) {
    return res.json(genericResponse);
  }

  // No SMTP configured: be honest that no email went out, rather than
  // pretending. Surface the real, working link so the flow still functions
  // for self-hosted / dev use.
  console.log(`[password reset] No SMTP configured. Reset link for ${user.email}: ${resetLink}`);
  return res.json({
    ...genericResponse,
    devNote: "No email server is configured for this app, so no email was actually sent.",
    resetLink,
  });
});

authRouter.post("/reset-password", async (req, res) => {
  const { token, password } = req.body ?? {};
  if (!token) return res.status(400).json({ error: "Missing reset token." });
  if (!isValidPassword(password || "")) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const result = await passwordResetStore.consume(hashResetToken(token));
  if (!result) {
    return res.status(400).json({ error: "This reset link is invalid or has expired." });
  }

  const passwordHash = await hashPassword(password);
  await userStore.updatePassword(result.userId, passwordHash);
  issueSession(res, result.userId);
  res.json({ ok: true });
});

// --- Account & security (used while already signed in) ---
authRouter.post("/change-password", requireAuth, async (req: AuthedRequest, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  const user = await userStore.findById(req.userId!);
  if (!user) return res.status(401).json({ error: "Not signed in." });

  if (!(await verifyPassword(currentPassword || "", user.password_hash))) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }
  if (!isValidPassword(newPassword || "")) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }

  const passwordHash = await hashPassword(newPassword);
  await userStore.updatePassword(user.id, passwordHash);
  res.json({ ok: true });
});

authRouter.post("/delete-account", requireAuth, async (req: AuthedRequest, res) => {
  const { password } = req.body ?? {};
  const user = await userStore.findById(req.userId!);
  if (!user) return res.status(401).json({ error: "Not signed in." });

  if (!(await verifyPassword(password || "", user.password_hash))) {
    return res.status(401).json({ error: "Password is incorrect." });
  }

  // Cascades to remove the account's saved modules/history/settings and
  // any pending password reset tokens too.
  await userStore.delete(user.id);
  clearSession(res);
  res.json({ ok: true });
});

// --- Per-account data sync (grades, history, settings) ---
dataRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const row = await dataStore.get(req.userId!);
  if (!row) return res.json({ modules: null, history: null, settings: null });
  // pg parses JSONB columns into JS values automatically, no JSON.parse needed.
  res.json({
    modules: row.modules,
    history: row.history,
    settings: row.settings,
  });
});

dataRouter.put("/", requireAuth, async (req: AuthedRequest, res) => {
  const { modules, history, settings } = req.body ?? {};
  if (modules === undefined || history === undefined || settings === undefined) {
    return res.status(400).json({ error: "modules, history, and settings are required." });
  }
  await dataStore.upsert(req.userId!, modules, history, settings);
  res.json({ ok: true });
});
