import { getSessions } from "../clients/openf1Client.js";

import { HttpError } from "../errors/httpError.js";
import { memoizeAsync } from "../utils/memoizeAsync.js";

export const FINISHED_GRACE_MS = 2 * 60 * 60 * 1000;

const FINISHED_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHED_SESSIONS = 30;

/** True once the session's data is final and safe to cache long-term. */
export function isSessionFinished(session, now = Date.now()) {
  const end = Date.parse(session?.date_end);
  return Number.isFinite(end) && end + FINISHED_GRACE_MS < now;
}

/** Find an OpenF1 session, throwing a 404 if it doesn't exist. */
export async function findSession(sessionKey) {
  const [session] = await getSessions({ session_key: sessionKey });
  if (!session) throw new HttpError(404, "Session not found.");
  return session;
}

/**
 * Finished sessions are memoized for a day and unfinished sessions are loaded fresh.
 */
export function cacheWhenFinished(
  load,
  { maxEntries = MAX_CACHED_SESSIONS } = {},
) {
  const cached = memoizeAsync(load, { ttlMs: FINISHED_TTL_MS, maxEntries });

  return async (sessionKey, ...args) => {
    const session = await findSession(sessionKey);
    const finished = isSessionFinished(session);
    const data = finished
      ? await cached(sessionKey, ...args)
      : await load(sessionKey, ...args);
    return { session, finished, data };
  };
}
