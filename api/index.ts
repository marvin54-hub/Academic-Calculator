import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
// Must be imported after express, and before routes are defined. Patches
// Express so a rejected promise in an async route handler is forwarded to
// the error-handling middleware below, instead of crashing the function
// invocation as an unhandled rejection.
import "express-async-errors";
import { authRouter, dataRouter } from "../server/routes.js";
import { aiRouter } from "../server/ai-assistant.js";

// On Vercel, environment variables come from the dashboard (or `vercel env
// pull` for local `vercel dev`), not from a .env.local file — but loading
// one here too is harmless if it doesn't exist, and helps if this file is
// ever run outside Vercel's environment.
dotenv.config({ path: [".env.local", ".env"] });

const app = express();
app.use(express.json());
app.use(cookieParser());

// vercel.json rewrites /api/* to this function with the /api prefix intact
// (Vercel does not strip it), so routes are mounted at the same paths the
// frontend already calls.
app.use("/api/auth", authRouter);
app.use("/api/data", dataRouter);
app.use("/api/ai-assistant", aiRouter);

// Catch-all error handler. Anything thrown or rejected in a route above
// (a bad DB connection string, a query failure, etc.) ends up here as a
// clean JSON 500 response instead of crashing the function invocation.
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Something went wrong on the server. Please try again." });
});

export default app;
