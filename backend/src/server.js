import express from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/health", async (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
})

httpServer.listen(PORT, () => {
    console.log(`\nF1 Pitwall API running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Health check: http://localhost:${PORT}/health\n`);
});
