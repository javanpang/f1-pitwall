import { getSessions } from "../clients/openf1Client.js";
import { HttpError } from "../errors/httpError.js";
import { shapeSession } from "./shapers.js";

export async function getSessionDetails(sessionKey) {
  const [session] = await getSessions({ session_key: sessionKey });
  if (!session) throw new HttpError(404, "Session not found.");

  return shapeSession(session);
}
