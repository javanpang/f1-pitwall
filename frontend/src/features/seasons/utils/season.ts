import type { MeetingWithSessions, Session } from "../../../shared/types/f1.ts";
import type {
  SessionTypeFilter,
  SessionStatus,
  SessionColumn,
  Round,
  FeaturedRound,
} from "../types.ts";

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

export const SESSION_COLUMNS: readonly SessionColumn[] = [
  { name: "Practice 1", label: "FP1", type: "Practice" },
  { name: "Practice 2", label: "FP2", type: "Practice" },
  { name: "Practice 3", label: "FP3", type: "Practice" },
  { name: "Qualifying", label: "Quali", type: "Qualifying" },
  { name: "Sprint Qualifying", label: "SQ", type: "Qualifying" },
  { name: "Sprint", label: "Sprint", type: "Race" },
  { name: "Race", label: "Race", type: "Race" },
];

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
export function getSessionStatus(session: Session, now: number): SessionStatus {
  const start = Date.parse(session.dateStart);
  if (now < start) return "upcoming";
  const end = session.dateEnd ? Date.parse(session.dateEnd) : null;
  return end !== null && now <= end ? "live" : "finished";
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
