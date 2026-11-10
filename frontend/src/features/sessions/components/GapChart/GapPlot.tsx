import { useMemo, useState, type PointerEvent } from "react";

import { GapTooltip } from "./GapTooltip.tsx";
import {
  CHART_HEIGHT_PX,
  MARGIN,
  computeGeometry,
  lapTicks,
} from "./geometry.ts";
import type { Sample, Series } from "./samples.ts";

interface GapPlotProps {
  samples: readonly Sample[];
  series: readonly Series[];
  totalLaps: number;
  width: number;
}

export function GapPlot({ samples, series, totalLaps, width }: GapPlotProps) {
  const [hoverLap, setHoverLap] = useState<number | null>(null);

  const { innerW, innerH, y, toX, toY, lines, labels, labelX } = useMemo(
    () => computeGeometry(samples, series, totalLaps, width),
    [samples, series, totalLaps, width],
  );

  // Snap to the nearest completed lap. If past the latest lap, stay on it.
  const hovered =
    hoverLap === null
      ? null
      : samples.reduce((best, s) =>
          Math.abs(s.lap - hoverLap) < Math.abs(best.lap - hoverLap) ? s : best,
        );

  const handlePointerMove = (e: PointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = box.width > 0 ? (e.clientX - box.left) / box.width : 0;
    setHoverLap(Math.min(Math.max(ratio, 0), 1) * totalLaps);
  };

  const xTicks = lapTicks(totalLaps);
  const hoverX = hovered ? toX(hovered.lap) : 0;

  return (
    <div className="relative">
      <svg
        width={width}
        height={CHART_HEIGHT_PX}
        viewBox={`0 0 ${width} ${CHART_HEIGHT_PX}`}
        aria-hidden="true"
        className="block font-mono text-[10px]"
      >
        {/* Grid + y axis */}
        {y.ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={MARGIN.left}
              x2={MARGIN.left + innerW}
              y1={toY(tick)}
              y2={toY(tick)}
              className={tick === 0 ? "stroke-muted/40" : "stroke-carbon-300"}
              strokeWidth={1}
            />
            <text
              x={MARGIN.left - 6}
              y={toY(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-faint tabular-nums"
            >
              {tick === 0 ? "LDR" : `+${tick}s`}
            </text>
          </g>
        ))}

        {/* X axis: lap number, start to last lap chequered flag */}
        {xTicks.map((lap, i) => (
          <text
            key={lap}
            x={toX(lap)}
            y={CHART_HEIGHT_PX - 6}
            textAnchor={
              i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"
            }
            className="fill-faint tabular-nums"
          >
            {lap === 0 ? "START" : `L${lap}`}
          </text>
        ))}

        {/* Lines */}
        {lines.map((line) => (
          <path
            key={line.driverNumber}
            data-driver={line.driverNumber}
            d={line.d}
            fill="none"
            stroke={line.colour}
            strokeWidth={2}
            strokeDasharray={line.dash}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* Direct labels at the line ends */}
        {labels.map((l) => (
          <g key={l.driverNumber}>
            <circle
              cx={l.end[0]}
              cy={l.end[1]}
              r={3}
              fill={l.colour}
              className="stroke-carbon-200"
              strokeWidth={2}
            />
            <text
              x={labelX}
              y={l.labelY}
              dominantBaseline="middle"
              className="fill-muted font-bold"
            >
              {l.acronym}
            </text>
          </g>
        ))}

        {/* Hover view */}
        {hovered && (
          <g>
            <line
              x1={hoverX}
              x2={hoverX}
              y1={MARGIN.top}
              y2={MARGIN.top + innerH}
              className="stroke-muted/50"
              strokeWidth={1}
            />
            {series.map((s) => {
              const g = hovered.gaps.get(s.driverNumber);
              return g == null ? null : (
                <circle
                  key={s.driverNumber}
                  cx={hoverX}
                  cy={toY(g)}
                  r={4}
                  fill={s.colour}
                  className="stroke-carbon-200"
                  strokeWidth={2}
                />
              );
            })}
          </g>
        )}

        {/* Hit target: the whole plot area, much bigger than any line */}
        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverLap(null)}
        />
      </svg>

      {hovered && (
        <GapTooltip
          hovered={hovered}
          series={series}
          hoverX={hoverX}
          width={width}
        />
      )}
    </div>
  );
}
