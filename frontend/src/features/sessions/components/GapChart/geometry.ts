import type { Sample, Series } from "./samples.ts";

export const CHART_HEIGHT_PX = 168;
export const MARGIN = { top: 10, right: 48, bottom: 20, left: 36 } as const;

const X_STEPS_LAPS = [1, 2, 5, 10, 15, 20, 25] as const;
const MAX_X_TICKS = 6;
const Y_STEPS_S = [0.5, 1, 2, 5, 10, 15, 30, 60] as const;
const MIN_Y_RANGE_S = 1;
const LABEL_SPACING_PX = 11;

type Point = [number, number];

/** Evenly spaced lap ticks, always ending on the final lap. */
export function lapTicks(totalLaps: number): number[] {
  const step =
    X_STEPS_LAPS.find((s) => totalLaps / s <= MAX_X_TICKS) ??
    Math.ceil(totalLaps / MAX_X_TICKS);
  const ticks: number[] = [];
  for (let lap = 0; lap < totalLaps - step / 2; lap += step) ticks.push(lap);
  return [...ticks, totalLaps];
}

/** Round the y-axis to a nice value. */
function niceYAxis(maxGap: number) {
  const max = Math.max(maxGap, MIN_Y_RANGE_S);
  const step = Y_STEPS_S.find((s) => max / s <= 4) ?? Math.ceil(max / 4);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  return { top, ticks };
}

/** Connect the lines using SVG path that lifts over unknown points. */
function linePath(points: readonly (Point | null)[]): string {
  let d = "";
  let penDown = false;
  for (const p of points) {
    if (!p) {
      penDown = false;
      continue;
    }
    d += `${penDown ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    penDown = true;
  }
  return d;
}

/** Pushes end-of-line labels apart so they never overlap. Input sorted by y. */
function spreadLabels(ys: number[], min: number, max: number): number[] {
  const out = [...ys];
  for (let i = 1; i < out.length; i++) {
    out[i] = Math.max(out[i], out[i - 1] + LABEL_SPACING_PX);
  }
  const overflow = out.at(-1)! - max;
  if (overflow > 0) {
    for (let i = out.length - 1; i >= 0; i--) {
      const ceiling =
        i === out.length - 1 ? max : out[i + 1] - LABEL_SPACING_PX;
      out[i] = Math.max(min, Math.min(out[i], ceiling));
    }
  }
  return out;
}

/** Scales, line paths and end-label positions for the plot. */
export function computeGeometry(
  samples: readonly Sample[],
  series: readonly Series[],
  totalLaps: number,
  width: number,
) {
  const innerW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const innerH = CHART_HEIGHT_PX - MARGIN.top - MARGIN.bottom;

  let maxGap = 0;
  for (const s of samples) {
    for (const { driverNumber } of series) {
      const g = s.gaps.get(driverNumber);
      if (g != null) maxGap = Math.max(maxGap, g);
    }
  }
  const y = niceYAxis(maxGap);

  const toX = (lap: number) =>
    MARGIN.left + (lap / Math.max(totalLaps, 1)) * innerW;
  const toY = (gap: number) => MARGIN.top + (gap / y.top) * innerH;

  const lines = series.map((s) => {
    const points = samples.map((sample): Point | null => {
      const g = sample.gaps.get(s.driverNumber);
      return g == null ? null : [toX(sample.lap), toY(g)];
    });
    return { ...s, d: linePath(points), end: points.at(-1) ?? null };
  });

  const ended = lines
    .filter((l): l is typeof l & { end: Point } => l.end !== null)
    .sort((a, b) => a.end[1] - b.end[1]);
  const labelYs = spreadLabels(
    ended.map((l) => l.end[1]),
    MARGIN.top,
    MARGIN.top + innerH,
  );
  const labels = ended.map((l, i) => ({ ...l, labelY: labelYs[i] }));

  const labelX = Math.max(...ended.map((l) => l.end[0]), MARGIN.left) + 8;

  return { innerW, innerH, y, toX, toY, lines, labels, labelX };
}
