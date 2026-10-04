import { getMeetings, getSessions } from "./openf1Service.js";

function shapeSession(s) {
  if (!s) return null;
  return {
    key: s.session_key,
    name: s.session_name,
    type: s.session_type,
    dateStart: s.date_start,
    dateEnd: s.date_end,
  };
}

function shapeMeeting(m) {
  if (!m) return null;
  return {
    key: m.meeting_key,
    name: m.meeting_name,
    officialName: m.meeting_official_name,
    circuit: m.circuit_short_name,
    country: m.country_name,
    location: m.location,
    dateStart: m.date_start,
    dateEnd: m.date_end,
    year: m.year,
  };
}

// === Date helpers ===
function toDate(value) {
  return value ? new Date(value) : null;
}

function byStart(a, b) {
  return toDate(a.date_start) - toDate(b.date_start);
}

function isLive(item, now) {
  const start = toDate(item.date_start);
  const end = toDate(item.date_end);
  return start !== null && end !== null && now >= start && now <= end;
}

function hasEnded(item, now) {
  const end = toDate(item.date_end);
  return end !== null && end < now;
}

export function resolveTargetMeeting(meetings, now) {
  const sorted = [...meetings].sort(byStart);

  for (const meeting of sorted) {
    if (isLive(meeting, now)) return { meeting, status: "live" };
    if (toDate(meeting.date_start) > now)
      return { meeting, status: "upcoming" };
  }

  return { meeting: sorted[sorted.length - 1], status: "season_over" };
}

export function resolveActiveSessions(sessions, now) {
  const sorted = [...sessions].sort(byStart);

  const activeSession = sorted.find((s) => isLive(s, now)) ?? null;
  const nextSession = sorted.find((s) => toDate(s.date_start) > now) ?? null;

  const lastSession =
    [...sorted].reverse().find((s) => hasEnded(s, now)) ?? null;

  const status = activeSession
    ? "session_live"
    : nextSession
      ? "between_sessions"
      : "weekend_over";

  return { activeSession, nextSession, lastSession, status };
}

export async function getRaceWeekend(now = new Date()) {
  const year = now.getUTCFullYear();

  let meetings = await getMeetings({ year });

  if (!meetings.length) {
    meetings = await getMeetings({ year: year - 1 });
  }
  if (!meetings.length) return null;

  const { meeting, status: meetingStatus } = resolveTargetMeeting(
    meetings,
    now,
  );

  const sessions = await getSessions({ meeting_key: meeting.meeting_key });

  const {
    activeSession,
    nextSession,
    lastSession,
    status: sessionStatus,
  } = resolveActiveSessions(sessions, now);

  const status =
    meetingStatus === "season_over"
      ? "season_over"
      : meetingStatus === "live"
        ? sessionStatus
        : meetingStatus;

  return {
    status,
    meeting: shapeMeeting(meeting),
    sessions: sessions.map(shapeSession),
    activeSession: shapeSession(activeSession),
    nextSession: shapeSession(nextSession),
    lastSession: shapeSession(lastSession),
  };
}
