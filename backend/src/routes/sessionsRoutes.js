import { Router } from "express";
import { HttpError } from "../errors/httpError.js";
import { getTrack } from "../services/trackService.js";

const router = Router();

// GET /api/sessions/:sessionKey/track
router.get("/:sessionKey/track", async (req, res) => {
  const { sessionKey: raw } = req.params;

  if (!/^[1-9]\d{0,8}$/.test(raw)) {
    throw new HttpError(400, "Session key must be a positive integer.");
  }

  const track = await getTrack(Number(raw));

  res.set("Cache-Control", "public, max-age=86400");
  res.json(track);
});

export default router;
