import type {
  MeetingWithSessions,
  RaceSession,
  SessionStatus,
  SessionTypeFilter,
} from "../types/f1.ts";

export const FIRST_SEASON = 2023;
export const CURRENT_YEAR = new Date().getUTCFullYear();

export const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - FIRST_SEASON + 1 },
  (_, i) => ({ value: CURRENT_YEAR - i, label: String(CURRENT_YEAR - i) }),
);

export const TYPE_OPTIONS: { value: SessionTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Practice", label: "Practice" },
  { value: "Qualifying", label: "Qualifying" },
  { value: "Race", label: "Race" },
];

export interface SessionColumn {
  name: string;
  label: string;
  type: Exclude<SessionTypeFilter, "all">;
}

export const SESSION_COLUMNS: readonly SessionColumn[] = [
  { name: "Practice 1", label: "FP1", type: "Practice" },
  { name: "Practice 2", label: "FP2", type: "Practice" },
  { name: "Practice 3", label: "FP3", type: "Practice" },
  { name: "Qualifying", label: "Quali", type: "Qualifying" },
  { name: "Sprint Qualifying", label: "SQ", type: "Qualifying" },
  { name: "Sprint", label: "Sprint", type: "Race" },
  { name: "Race", label: "Race", type: "Race" },
];

export interface Round extends MeetingWithSessions {
  round: number;
}

/**
 * Adds a round number to each race weekend in the season, sorted in reverse chronological order.
 */
export function withRounds(season: MeetingWithSessions[]): Round[] {
  return [...season]
    .sort(
      (a, b) =>
        Date.parse(a.meeting.dateStart) - Date.parse(b.meeting.dateStart),
    )
    .map((m, i) => ({ ...m, round: i + 1 }))
    .reverse();
}

/**
 * Filter the rounds based on the selected session type filter. (all, Practice, Qualifying, Race)
 */
export function filterByType(
  rounds: Round[],
  filter: SessionTypeFilter,
): Round[] {
  if (filter === "all") return rounds;
  return rounds.filter((r) => r.sessions.some((s) => s.type === filter));
}

/**
 * Get the visible session columns based on the selected session type filter. (all, Practice, Qualifying, Race)
 */
export function getVisibleColumns(
  filter: SessionTypeFilter,
): readonly SessionColumn[] {
  return filter === "all"
    ? SESSION_COLUMNS
    : SESSION_COLUMNS.filter((c) => c.type === filter);
}

/**
 * Get the status of a session based on the current timestamp. (finished, live, upcoming)
 */
export function getSessionStatus(
  session: RaceSession,
  now: number,
): SessionStatus {
  const start = Date.parse(session.dateStart);
  if (now < start) return "upcoming";
  const end = session.dateEnd ? Date.parse(session.dateEnd) : null;
  return end !== null && now <= end ? "live" : "finished";
}

export interface FeaturedRound {
  key: number;
  kind: "live" | "next";
}

/**
 * Find the featured round in the season based on the current timestamp. The featured round is either the live round or the next upcoming round.
 */
export function findFeaturedRound(
  rounds: Round[],
  now: number,
): FeaturedRound | null {
  const chronological = [...rounds].sort((a, b) => a.round - b.round);

  for (const r of chronological) {
    const statuses = r.sessions.map((s) => getSessionStatus(s, now));
    if (statuses.includes("live")) return { key: r.meeting.key, kind: "live" };
    if (statuses.includes("upcoming"))
      return { key: r.meeting.key, kind: "next" };
  }
  return null;
}

/**
 * Format an ISO date string into a human-readable format with the day, month, and time in UTC.
 */
export function formatWhen(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return `${day} · ${time} UTC`;
}

/**
 * Format a date range from two ISO date strings into a human-readable format. If the start and end dates are in the same month, it will display the day range and month. If they are in different months, it will display the full date range with both months.
 */
export function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const month = (d: Date) =>
    d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });

  if (s.getUTCMonth() === e.getUTCMonth()) {
    return `${s.getUTCDate()}-${e.getUTCDate()} ${month(e)}`;
  }
  return `${s.getUTCDate()} ${month(s)} - ${e.getUTCDate()} ${month(e)}`;
}
