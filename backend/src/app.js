import express from "express";
import cors from "cors";

import { errorHandler } from "./middleware/errorHandler.js";
import weekendRoutes from "./routes/weekendRoutes.js";
import seasonRoutes from "./routes/seasonRoutes.js";

export function createApp({ frontendUrl = "http://localhost:5173" } = {}) {
  const app = express();

  app.use(cors({ origin: frontendUrl, credentials: true }));

  app.use("/api/weekends", weekendRoutes);
  app.use("/api/seasons", seasonRoutes);

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    });
  });

  app.use((req, res) => {
    res
      .status(404)
      .json({ error: `Route ${req.method} ${req.path} not found` });
  });
  app.use(errorHandler);

  return app;
}
