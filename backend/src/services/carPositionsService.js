import {
  getDrivers,
  getLocation,
  getSessions,
} from "../clients/openf1Client.js";

import { HttpError } from "../errors/httpError.js";
import { memoizeAsync } from "../utils/memoizeAsync.js";

export const CHUNK_MS = 60_000;
// Extra time fetched before a chunk so cars can be interpolated from the previous sample.
const LEAD_IN_MS = 3_000;

const FINISHED_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHED_SESSIONS = 30;
const MAX_CACHED_CHUNKS = 300;

const FALLBACK_TEAM_COLOUR = "#9CA3AF";

const isOnTrack = (s) =>
  Number.isFinite(s.x) && Number.isFinite(s.y) && !(s.x === 0 && s.y === 0);

/**
 * Groups location samples by driver as `[msSinceFrom, x, y]` tuples sorted by time,
 * dropping telemetry dropouts.
 */
export function buildCarTracks(samples, drivers, fromMs) {
  const byDriver = new Map();
  for (const s of samples) {
    if (!isOnTrack(s)) continue;
    const t = Date.parse(s.date) - fromMs;
    if (!Number.isFinite(t)) continue;

    let list = byDriver.get(s.driver_number);
    if (!list) byDriver.set(s.driver_number, (list = []));
    list.push([t, s.x, s.y]);
  }

  const info = new Map(drivers.map((d) => [d.driver_number, d]));

  return [...byDriver]
    .sort(([a], [b]) => a - b)
    .map(([driverNumber, list]) => {
      const d = info.get(driverNumber);
      return {
        driverNumber,
        acronym: d?.name_acronym ?? String(driverNumber),
        teamColour: d?.team_colour ? `#${d.team_colour}` : FALLBACK_TEAM_COLOUR,
        samples: list.sort((a, b) => a[0] - b[0]),
      };
    });
}

const getSessionDrivers = memoizeAsync(getDrivers, {
  ttlMs: FINISHED_TTL_MS,
  maxEntries: MAX_CACHED_SESSIONS,
});

async function loadChunk(sessionKey, fromMs) {
  const [samples, drivers] = await Promise.all([
    getLocation({
      sessionKey,
      from: new Date(fromMs - LEAD_IN_MS).toISOString(),
      to: new Date(fromMs + CHUNK_MS).toISOString(),
    }),
    getSessionDrivers(sessionKey),
  ]);

  return {
    from: new Date(fromMs).toISOString(),
    to: new Date(fromMs + CHUNK_MS).toISOString(),
    cars: buildCarTracks(samples, drivers, fromMs),
  };
}

const getFinishedChunk = memoizeAsync(loadChunk, {
  ttlMs: FINISHED_TTL_MS,
  maxEntries: MAX_CACHED_CHUNKS,
});

/**
 * Returns every car's position samples for the `CHUNK_MS` window starting at `fromMs`.
 */
export async function getCarPositions(sessionKey, fromMs) {
  const [session] = await getSessions({ session_key: sessionKey });
  if (!session) throw new HttpError(404, "Session not found");

  const finished = Date.parse(session.date_end) < Date.now();
  const chunk = finished
    ? await getFinishedChunk(sessionKey, fromMs)
    : await loadChunk(sessionKey, fromMs);

  return { finished, chunk };
}
