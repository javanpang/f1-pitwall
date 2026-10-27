import { Router } from "express";
import { HttpError } from "../errors/httpError.js";
import { getTrack } from "../services/trackService.js";
import { getTiming } from "../services/timingService.js";
import { getSessionDetails } from "../services/sessionService.js";

const SESSION_KEY_PATTERN = /^[1-9]\d{0,8}$/;

const router = Router();

router.param("sessionKey", (req, res, next, raw) => {
  if (!SESSION_KEY_PATTERN.test(raw)) {
    return next(new HttpError(400, "Session key must be a positive integer."));
  }
  next();
});

function parseAt(raw) {
  if (raw === undefined) return null;
  const ms = typeof raw === "string" ? Date.parse(raw) : NaN;
  if (!Number.isFinite(ms)) {
    throw new HttpError(400, "`at` must be an ISO 8601 timestamp.");
  }
  return ms;
}

// GET /api/sessions/:sessionKey
router.get("/:sessionKey", async (req, res) => {
  const detail = await getSessionDetails(Number(req.params.sessionKey));

  const finished = Date.parse(detail.session.dateEnd) < Date.now();
  res.set("Cache-Control", finished ? "public, max-age=86400" : "no-store");
  res.json(detail.session);
});

// GET /api/sessions/:sessionKey/track
router.get("/:sessionKey/track", async (req, res) => {
  const track = await getTrack(Number(req.params.sessionKey));

  res.set("Cache-Control", "public, max-age=86400");
  res.json(track);
});

// GET /api/sessions/:sessionKey/timing?at=2026-01-01T12:00:00Z
router.get("/:sessionKey/timing", async (req, res) => {
  const at = parseAt(req.query.at);
  const { rows, finished } = await getTiming(Number(req.params.sessionKey), at);

  res.set("Cache-Control", finished ? "public, max-age=86400" : "no-store");
  res.json(rows);
});

export default router;
