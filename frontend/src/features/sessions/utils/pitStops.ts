import type { PitStop } from "../types";

/** Stops that have happened by `atMs`, newest first. Expects `stops` oldest first. */
export function pitStopsUpTo(stops: PitStop[], atMs: number): PitStop[] {
  let lo = 0;
  let hi = stops.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (Date.parse(stops[mid].date) <= atMs) lo = mid + 1;
    else hi = mid;
  }
  return stops.slice(0, lo).reverse();
}

/**
 * Places gained (positive) or lost (negative) through the stop. Null while unknown.
 */
export function positionDelta(stop: PitStop, atMs: number): number | null {
  if (stop.positionBefore === null || stop.positionAfter === null) return null;
  if (stop.settledAt === null || Date.parse(stop.settledAt) > atMs) return null;
  return stop.positionBefore - stop.positionAfter;
}

/** Stationary time if known, else pit lane time. */
export function formatPitDuration(stop: PitStop): string | null {
  const seconds = stop.stopSeconds ?? stop.laneSeconds;
  return seconds === null ? null : `${seconds.toFixed(1)}s`;
}
