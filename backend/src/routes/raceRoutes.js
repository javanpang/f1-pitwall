import { Router } from "express";
import { getRaceWeekend } from "../services/raceService.js";

const router = Router();

// GET /api/race/weekend
router.get("/weekend", async (req, res) => {
  const data = await getRaceWeekend();
  if (!data) return res.status(404).json({ error: "No race weekend found" });
  res.json(data);
});

export default router;
