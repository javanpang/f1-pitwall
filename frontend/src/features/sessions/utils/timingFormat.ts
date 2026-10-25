import type { TimeStatus, TyreCompound } from "../types";

const EMPTY = "-";

/** Rounds seconds to MM:SS.mmm format. Rounds to whole ms first. */
export function formatLapTime(seconds: number | null): string {
  if (seconds === null) return EMPTY;
  const totalMs = Math.round(seconds * 1000);
  const minutes = Math.floor(totalMs / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;
  return `${minutes}:${String(secs).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

/** Formats a sector time to 3 decimal places. */
export function formatSector(seconds: number | null): string {
  return seconds === null ? EMPTY : seconds.toFixed(3);
}

/** Format interval time. Null means leader. */
export function formatInterval(seconds: number | null): string {
  return seconds === null ? "LEADER" : `+${seconds.toFixed(3)}`;
}

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
  "no-time": "text-yellow-300",
};
