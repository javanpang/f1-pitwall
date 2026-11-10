import { Swatch } from "./Legend.tsx";
import { formatGap, type Sample, type Series } from "./samples.ts";

interface GapTooltipProps {
  hovered: Sample;
  series: readonly Series[];
  hoverX: number;
  width: number;
}

/** Floating readout beside the hover line; flips side past the midpoint. */
export function GapTooltip({
  hovered,
  series,
  hoverX,
  width,
}: GapTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute top-1 z-10 rounded-sm border border-carbon-300 bg-carbon-100/95 px-2 py-1.5 font-mono text-[11px] tabular-nums shadow-lg"
      style={
        hoverX > width / 2
          ? { right: width - hoverX + 8 }
          : { left: hoverX + 8 }
      }
    >
      <div className="mb-1 text-faint">
        {hovered.lap === 0 ? "Start" : `Lap ${hovered.lap}`}
      </div>
      {series.map((s) => (
        <div key={s.driverNumber} className="flex items-center gap-2">
          <Swatch colour={s.colour} dash={s.dash} />
          <span className="w-8 font-bold text-body">{s.acronym}</span>
          <span className="text-muted">
            {formatGap(hovered, s.driverNumber)}
          </span>
        </div>
      ))}
    </div>
  );
}
