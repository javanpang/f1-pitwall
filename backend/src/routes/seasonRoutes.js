import { Router } from "express";
import { HttpError } from "../errors/httpError.js";
import { getSeason } from "../services/seasonService.js";

const FIRST_SEASON = 2023; // OpenF1 has no data before this

const router = Router();

// GET /api/seasons/:year
router.get("/:year", async (req, res) => {
  const { year: raw } = req.params;
  const year = Number(raw);
  const maxYear = new Date().getUTCFullYear();

  // Filter out other Number() values
  if (!/^\d{4}$/.test(raw) || year < FIRST_SEASON || year > maxYear) {
    throw new HttpError(
      400,
      `Year must be between ${FIRST_SEASON} and ${maxYear}.`,
    );
  }

  res.json(await getSeason(year));
});

export default router;
