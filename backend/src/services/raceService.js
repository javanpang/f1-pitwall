import { getMeetings, getSessions } from "../services/openf1Service.js";

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

function resolveTargetMeeting(meetings, now) {
  const sorted = [...meetings].sort(
    (a, b) => new Date(a.date_start) - new Date(b.date_start),
  );

  for (const meeting of sorted) {
    const start = new Date(meeting.date_start);
    const end = new Date(meeting.date_end);

    if (now >= start && now <= end) return { meeting, status: "live" };

    if (start > now) return { meeting, status: "upcoming" };
  }

  return { meeting: sorted[sorted.length - 1], status: "season_over" };
}

function resolveActiveSessions(sessions, now) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.date_start) - new Date(b.date_start),
  );

  let activeSession = null;
  let nextSession = null;
  let lastSession = sorted[sorted.length - 1] ?? null;

  for (const session of sorted) {
    const start = new Date(session.date_start);
    const end = new Date(session.date_end);

    if (now >= start && now <= end) activeSession = session;
    else if (start > now && !nextSession) nextSession = session;
  }

  const status = activeSession
    ? "session_live"
    : nextSession
      ? "between_sessions"
      : "weekend_over";

  return { activeSession, nextSession, lastSession, status };
}

export async function getRaceWeekend() {
  const now = new Date();
  const year = now.getFullYear();

  const meetings = await getMeetings({ year });
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
