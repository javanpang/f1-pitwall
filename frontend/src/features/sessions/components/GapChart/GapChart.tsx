import { useMemo } from "react";

import type { LapGaps, TimingRow } from "../../types.ts";
import { GapPlot } from "./GapPlot.tsx";
import { Legend } from "./Legend.tsx";
import {
  TRACKED_DRIVERS,
  buildSeries,
  formatGap,
  samplesUpTo,
} from "./samples.ts";
import { useElementWidth } from "./useElementWidth.ts";

const FALLBACK_WIDTH_PX = 480;

interface GapChartProps {
  rows: readonly TimingRow[];
  lapGaps: LapGaps;
  at: string | null;
}

export function GapChart({ rows, lapGaps, at }: GapChartProps) {
  const [setContainer, measuredWidth] = useElementWidth();
  const { totalLaps } = lapGaps;

  const series = useMemo(() => buildSeries(rows, TRACKED_DRIVERS), [rows]);
  const samples = useMemo(
    () => (at ? samplesUpTo(lapGaps.laps, at, series) : []),
    [lapGaps.laps, at, series],
  );

  const latest = samples.at(-1);
  const hasGaps =
    latest !== undefined && samples.length > 1 && series.length > 0;

  return (
    <>
      <h2 className="shrink-0 border-b border-carbon-300 px-1 py-1 font-mono text-[10px] font-medium tracking-widest text-muted uppercase">
        Gap to leader - Top {TRACKED_DRIVERS}
      </h2>

      <div
        ref={setContainer}
        className="min-h-48 min-w-0 flex-1 overflow-hidden"
      >
        {hasGaps ? (
          <>
            <Legend series={series} latest={latest} />
            <GapPlot
              samples={samples}
              series={series}
              totalLaps={totalLaps}
              width={measuredWidth || FALLBACK_WIDTH_PX}
            />
            <table className="sr-only" aria-label="Gap to leader">
              <thead>
                <tr>
                  <th scope="col">Driver</th>
                  <th scope="col">Gap</th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => (
                  <tr key={s.driverNumber}>
                    <th scope="row">{s.acronym}</th>
                    <td>{formatGap(latest, s.driverNumber)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p
            role="status"
            className="p-4 font-mono text-xs tracking-widest text-faint uppercase"
          >
            No gap data at this point in the session
          </p>
        )}
      </div>
    </>
  );
}
