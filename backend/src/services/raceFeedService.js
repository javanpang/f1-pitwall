import {
  getDrivers,
  getPits,
  getRaceControl,
  getSessions,
} from "../clients/openf1Client.js";

import { HttpError } from "../errors/httpError.js";
import { memoizeAsync } from "../utils/memoizeAsync.js";
import { buildRaceFeed } from "./buildRaceFeed.js";

const FINISHED_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHED_SESSIONS = 30;

async function loadRaceFeed(sessionKey) {
  const [raceControl, pits, drivers] = await Promise.all([
    getRaceControl(sessionKey),
    getPits(sessionKey),
    getDrivers(sessionKey),
  ]);
  return buildRaceFeed({ raceControl, pits, drivers });
}

const getFinishedRaceFeed = memoizeAsync(loadRaceFeed, {
  ttlMs: FINISHED_TTL_MS,
  maxEntries: MAX_CACHED_SESSIONS,
});

export async function getRaceFeed(sessionKey) {
  const [session] = await getSessions({ session_key: sessionKey });
  if (!session) throw new HttpError(404, "Session not found");

  const finished = Date.parse(session.date_end) < Date.now();
  const events = finished
    ? await getFinishedRaceFeed(sessionKey)
    : await loadRaceFeed(sessionKey);

  return { finished, events };
}
