import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { getRaceWeekend } from "../services/raceService.js";

const router = Router();

// GET /api/race/weekend
router.get(
  "/weekend",
  asyncHandler(async (req, res) => {
    const data = await getRaceWeekend();
    if (!data) return res.status(404).json({ error: "No session found" });
    res.json(data);
  }),
);

export default router;
