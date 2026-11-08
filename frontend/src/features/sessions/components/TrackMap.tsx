import { useMemo, type ReactNode } from "react";
import type { TrackPoint } from "../types.ts";
import { buildTrackGeometry, type TrackGeometry } from "../utils/track.ts";

interface TrackMapProps {
  points: readonly TrackPoint[];
  label: string;
  children?: (geometry: TrackGeometry) => ReactNode; // Optional function to render additional SVG elements on top of the track
}

/**
 * Renders a circuit outline as an SVG, with optional overlays on top.
 */
export function TrackMap({ points, label, children }: TrackMapProps) {
  const geometry = useMemo(() => buildTrackGeometry(points), [points]);

  if (!geometry) {
    return (
      <p
        role="status"
        className="font-mono text-xs tracking-widest text-faint uppercase"
      >
        Track data unavailable
      </p>
    );
  }

  const { path, viewBox, start } = geometry;

  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={label}
      className="h-full w-full"
    >
      <path
        d={path}
        fill="none"
        strokeWidth={14}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-carbon-300"
      />
      <path
        d={path}
        fill="none"
        strokeWidth={2}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-accent"
      />
      <path
        d={`M${start.x} ${start.y}h0`}
        strokeWidth={10}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="stroke-white"
      />
      {children?.(geometry)}
    </svg>
  );
}
