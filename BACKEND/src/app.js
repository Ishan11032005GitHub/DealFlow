import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import submissionsRoutes from "./routes/submissions.routes.js";
import { notFound, errorHandler } from "./middleware/error.js";

export function makeApp() {
  const app = express();

  app.use(cors({
    origin: true,
    credentials: false,
  }));

  app.use(express.json({ limit: "1mb" }));

  const submitLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);

  // ✅ ONLY public submit is rate-limited
  app.post("/api/submissions", submitLimiter, submissionsRoutes);
  app.use("/api/submissions", submissionsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
