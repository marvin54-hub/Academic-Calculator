import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
// Must be imported after express, and before routes are defined. Patches
// Express so a rejected promise in an async route handler is forwarded to
// the error-handling middleware below, instead of crashing the whole
// process as an unhandled rejection.
import "express-async-errors";
import { authRouter, dataRouter } from "./server/routes.js";
import { aiRouter } from "./server/ai-assistant.js";

// Load .env.local first (the file this project's docs and .env.example
// tell you to create), then fall back to a plain .env if present. The
// dotenv package does NOT read .env.local automatically by default —
// that's a Vite frontend convention, not something Node's dotenv does
// on its own — so this has to be explicit.
dotenv.config({ path: [".env.local", ".env"] });

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/data", dataRouter);
app.use("/api/ai-assistant", aiRouter);

// Catch-all error handler. Anything thrown or rejected in a route above
// (a bad DB connection string, a query failure, etc.) ends up here as a
// clean JSON 500 response instead of taking down the whole server.
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Something went wrong on the server. Please try again." });
});

const PORT = Number(process.env.PORT) || 3000;

// Configure Vite middleware in development, or serve built assets in production.
// This static/dev-server serving logic is only relevant when running this
// app yourself (e.g. on a VPS or Railway/Render); on Vercel, the frontend
// is served as a static build separately from api/index.ts (see vercel.json).
async function configureApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Academic Calculator backend running on http://0.0.0.0:${PORT}`);
  });
}

configureApp();
