import { formatGap, type Sample, type Series } from "./samples.ts";

/** A visual representation of a driver's color and dash pattern. */
export function Swatch({ colour, dash }: { colour: string; dash?: string }) {
  return (
    <svg width={14} height={6} aria-hidden="true" className="shrink-0">
      <line
        x1={1}
        x2={13}
        y1={3}
        y2={3}
        stroke={colour}
        strokeWidth={2}
        strokeDasharray={dash ? "3 2" : undefined}
        strokeLinecap="round"
      />
    </svg>
  );
}

interface LegendProps {
  series: readonly Series[];
  latest: Sample;
}

/** A legend for the gap chart. */
export function Legend({ series, latest }: LegendProps) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2 py-1.5 font-mono text-[11px] tabular-nums">
      {series.map((s) => (
        <li key={s.driverNumber} className="flex items-center gap-1.5">
          <Swatch colour={s.colour} dash={s.dash} />
          <span className="font-bold text-body">{s.acronym}</span>
          <span className="text-muted">
            {formatGap(latest, s.driverNumber)}
          </span>
        </li>
      ))}
    </ul>
  );
}
