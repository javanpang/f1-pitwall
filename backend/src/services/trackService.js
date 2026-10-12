import { getLaps, getLocation, getSessions } from "../clients/openf1Client.js";
import { HttpError } from "../errors/httpError.js";
import { memoizeAsync } from "../utils/memoizeAsync.js";

const CIRCUIT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const MIN_POINTS = 50;

const noTrackData = () =>
  new HttpError(404, "No track data available for this session");

// Fastest valid lap is guaranteed to be a complete lap, so it can be used to get the track outline.
export function pickReferenceLap(laps) {
  let best = null;
  for (const lap of laps) {
    if (lap.is_pit_out_lap || !lap.date_start || !(lap.lap_duration > 0)) {
      continue;
    }
    if (!best || lap.lap_duration < best.lap_duration) best = lap;
  }
  return best;
}

/**
 * Returns the start and end timestamps of a lap.
 */
export function lapWindow(lap) {
  const start = new Date(lap.date_start);
  const end = new Date(start.getTime() + lap.lap_duration * 1000);

  return { from: start.toISOString(), to: end.toISOString() };
}

/**
 * Converts telemetry samples to track points, filtering out invalid points and sorting by time.
 */
export function toTrackPoints(samples) {
  return samples
    .filter(
      (s) =>
        Number.isFinite(s.x) &&
        Number.isFinite(s.y) &&
        !(s.x === 0 && s.y === 0),
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(({ x, y }) => ({ x, y }));
}

/**
 * Loads the track outline for a session by finding the fastest lap and retrieving its telemetry.
 * Throws a 404 error if no usable lap or track data is found.
 */
async function loadTrack({ session }) {
  const laps = await getLaps(session.session_key);
  const lap = pickReferenceLap(laps);

  if (!lap) throw noTrackData();

  const { from, to } = lapWindow(lap);
  const samples = await getLocation({
    sessionKey: session.session_key,
    driverNumber: lap.driver_number,
    from,
    to,
  });

  const points = toTrackPoints(samples);
  if (points.length < MIN_POINTS) throw noTrackData();

  return {
    circuitKey: session.circuit_key,
    circuitName: session.circuit_short_name,
    year: session.year,
    points,
  };
}

/**
 * Loads the track outline for a session, caching the result on `CIRCUIT_CACHE_TTL_MS`.
 */
const loadCircuitTrack = memoizeAsync(loadTrack, {
  ttlMs: CIRCUIT_CACHE_TTL_MS,
  key: ({ session }) => `${session.circuit_key}-${session.year}`,
});

/**
 * Fetches the track outline for a session, using a cached result if available.
 */
export async function getTrack(sessionKey) {
  const [session] = await getSessions({ session_key: sessionKey });
  if (!session) throw new HttpError(404, "Session not found");

  return loadCircuitTrack({ session });
}
