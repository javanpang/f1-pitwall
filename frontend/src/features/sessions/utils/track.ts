import type { TrackPoint } from "../types.ts";

export interface TrackGeometry {
  path: string;
  viewBox: string;
  start: TrackPoint;
}

// Round to 1 decimal place
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Builds the SVG path and viewBox for a track outline from telemetry points.
 */
export function buildTrackGeometry(
  points: readonly TrackPoint[],
  padding = 0.05,
): TrackGeometry | null {
  if (points.length < 2) return null;

  const svgPoints = points.map((p) => ({ x: p.x, y: -p.y }));

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of svgPoints) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const width = maxX - minX;
  const height = maxY - minY;

  const pad = Math.max(width, height) * padding;

  const path =
    svgPoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${round1(p.x)} ${round1(p.y)}`)
      .join(" ") + " Z";

  return {
    path,
    viewBox: `${minX - pad} ${minY - pad} ${
      width + 2 * pad
    } ${height + 2 * pad}`,
    start: svgPoints[0],
  };
}
