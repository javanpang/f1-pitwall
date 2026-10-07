import { getMeetings, getSessions } from "../clients/openf1Client.js";
import { shapeMeeting, shapeSession } from "./shapers.js";

const byStart = (a, b) => new Date(a.date_start) - new Date(b.date_start);

const isTesting = (meeting) => /test/i.test(meeting.meeting_name ?? "");

/**
 * Fetches and shapes the season data for a given year. Meetings are filtered to exclude testing events and sorted by their start date.
 */
export async function getSeason(year) {
  const [meetings, sessions] = await Promise.all([
    getMeetings({ year }),
    getSessions({ year }),
  ]);

  const sessionsByMeeting = Map.groupBy(sessions, (s) => s.meeting_key);

  return meetings
    .filter((m) => !isTesting(m))
    .sort(byStart)
    .map((m) => ({
      meeting: shapeMeeting(m),
      sessions: (sessionsByMeeting.get(m.meeting_key) ?? [])
        .sort(byStart)
        .map(shapeSession),
    }));
}
