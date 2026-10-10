import type { TrackPoint } from "../types.ts";

export const FAKE_TRACK: TrackPoint[] = Array.from({ length: 240 }, (_, i) => {
  const t = (i / 240) * 2 * Math.PI;
  const r = 1 + 0.25 * Math.cos(3 * t) + 0.12 * Math.sin(2 * t);
  return {
    x: Math.round(r * Math.cos(t) * 6000),
    y: Math.round(r * Math.sin(t) * 3500),
  };
});
