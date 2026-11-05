import type { TimeStatus, TyreCompound } from "../types";

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

// ------ Durations ------

/** Rounds seconds to MM:SS.mmm format. Rounds to whole ms first. */
export function formatLapTime(seconds: number | null): string | null {
  if (seconds === null) return null;
  const totalMs = Math.round(seconds * 1000);
  const minutes = Math.floor(totalMs / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  return `${minutes}:${pad(secs)}.${pad(totalMs % 1000, 3)}`;
}

/** Formats a sector time to 3 decimal places. */
export function formatSector(seconds: number | null): string | null {
  return seconds === null ? null : seconds.toFixed(3);
}

/** Format interval time. Null means no gap is known. */
export function formatInterval(
  seconds: number | null,
  isLeader: boolean,
): string | null {
  if (isLeader) return "LEADER";
  return seconds === null ? null : `+${seconds.toFixed(3)}`;
}

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

// ------ Teams ------
export const shortTeamName = (teamName: string): string =>
  teamName.replace(/ F1 Team$/, "").replace(/^Red Bull Racing$/, "Red Bull");

// ------ Lookups ------
export const TYRE_CONFIG: Record<
  TyreCompound,
  { letter: string; colour: string }
> = {
  SOFT: { letter: "S", colour: "#ef4444" },
  MEDIUM: { letter: "M", colour: "#facc15" },
  HARD: { letter: "H", colour: "#f3f4f6" },
  INTERMEDIATE: { letter: "I", colour: "#22c55e" },
  WET: { letter: "W", colour: "#3b82f6" },
  UNKNOWN: { letter: "?", colour: "#6b7280" },
};

/** Tailwind classes for time statuses. */
export const TIME_STATUS_CLASS: Record<TimeStatus, string> = {
  "overall-best": "text-purple-400",
  "personal-best": "text-green-400",
  default: "text-body",
};
