import { shapeSession } from "../transforms/shapers.js";
import { findSession, isSessionFinished } from "./sessionCache.js";

export async function getSessionDetails(sessionKey) {
  const session = await findSession(sessionKey);
  return {
    finished: isSessionFinished(session),
    session: shapeSession(session),
  };
}
