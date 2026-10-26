import {
  getSessions,
  getDrivers,
  getIntervals,
  getLaps,
  getPits,
  getPositions,
  getStints,
} from "../clients/openf1Client.js";

import { HttpError } from "../errors/httpError.js";
import { memoizeAsync } from "../utils/memoizeAsync.js";
import {
  buildTimingTowerRows,
  indexTimingData,
} from "./buildTimingTowerRows.js";

const FINISHED_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHED_SESSIONS = 30;

async function loadTimingIndex(sessionKey) {
  const [drivers, positions, intervals, laps, stints, pits] = await Promise.all(
    [
      getDrivers(sessionKey),
      getPositions(sessionKey),
      getIntervals(sessionKey),
      getLaps(sessionKey),
      getStints(sessionKey),
      getPits(sessionKey),
    ],
  );
  return indexTimingData({ drivers, positions, intervals, laps, stints, pits });
}

const getFinishedIndex = memoizeAsync(loadTimingIndex, {
  ttlMs: FINISHED_TTL_MS,
  maxEntries: MAX_CACHED_SESSIONS,
});

export async function getTiming(sessionKey, at = null) {
  const [session] = await getSessions({ session_key: sessionKey });
  if (!session) throw new HttpError(404, "Session not found");

  const finished = Date.parse(session.date_end) < Date.now();
  const index = finished
    ? await getFinishedIndex(sessionKey)
    : await loadTimingIndex(sessionKey);

  return { finished, rows: buildTimingTowerRows(index, at) };
}
