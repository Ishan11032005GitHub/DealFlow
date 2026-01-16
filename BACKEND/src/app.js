import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import submissionsRoutes from "./routes/submissions.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

export function makeApp() {
  const app = express();

  // CORS for local dev; lock down later if needed
  app.use(cors({
    origin: true,
    credentials: false,
  }));

  app.use(express.json({ limit: "1mb" }));

  // Light protection for public submission endpoint
  const submitLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30, // 30 req/min per IP
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/submissions", submitLimiter, submissionsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
