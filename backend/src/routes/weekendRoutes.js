import { Router } from "express";
import { getCurrentWeekend } from "../services/weekendService.js";

const router = Router();

// GET /api/weekends/current
router.get("/current", async (req, res) => {
  const data = await getCurrentWeekend();
  if (!data) return res.status(404).json({ error: "No weekend found" });
  res.json(data);
});

export default router;
