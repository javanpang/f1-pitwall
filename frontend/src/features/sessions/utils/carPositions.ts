import type { CarSample, TrackPoint } from "../types.ts";

// match the backend's chunk size so chunk boundaries line up.
export const POSITIONS_CHUNK_MS = 60_000;

// Beyond this gap between samples the car is treated as missing (retired, in the garage).
const MAX_GAP_MS = 5_000;

/**
 * Linearly interpolates a car's position at `t` (ms since chunk start).
 * Returns null when `t` falls outside the samples or inside a telemetry gap.
 */
export function interpolatePosition(
  samples: readonly CarSample[],
  t: number,
): TrackPoint | null {
  if (samples.length === 0) return null;

  // Index of the first sample later than t.
  let lo = 0;
  let hi = samples.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (samples[mid][0] <= t) lo = mid + 1;
    else hi = mid;
  }

  const prev = samples[lo - 1];
  const next = samples[lo];
  if (!prev) return null;
  if (!next) {
    return t - prev[0] <= MAX_GAP_MS ? { x: prev[1], y: prev[2] } : null;
  }

  const gap = next[0] - prev[0];
  if (gap > MAX_GAP_MS) return null;

  const f = gap > 0 ? (t - prev[0]) / gap : 0;
  return {
    x: prev[1] + (next[1] - prev[1]) * f,
    y: prev[2] + (next[2] - prev[2]) * f,
  };
}
