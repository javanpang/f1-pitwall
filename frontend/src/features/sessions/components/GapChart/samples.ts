import type { LapGap, TimingRow } from "../../types.ts";
import { formatInterval } from "../../utils/timingFormat.ts";

export const TRACKED_DRIVERS = 4;
const TEAMMATE_DASH = "5 3"; // The second car of the team has same colour, so dash it

export interface Sample {
  lap: number;
  leader: number;
  gaps: ReadonlyMap<number, number>;
}

export interface Series {
  driverNumber: number;
  acronym: string;
  colour: string;
  dash: string | undefined;
}

/** Laps the leader has completed by `at` */
export function samplesUpTo(
  laps: readonly LapGap[],
  at: string,
  series: readonly Series[],
): Sample[] {
  const atMs = Date.parse(at);
  const start: Sample = {
    lap: 0,
    leader: series[0]?.driverNumber ?? -1,
    gaps: new Map(series.map((s) => [s.driverNumber, 0])),
  };
  const done = laps
    .filter((l) => Date.parse(l.at) <= atMs)
    .map((l) => ({
      lap: l.lap,
      leader: l.leader,
      gaps: new Map(
        Object.entries(l.gaps).map(([n, g]) => [Number(n), g] as const),
      ),
    }));
  return [start, ...done];
}

/** Series follow the current top N drivers. If 2 teammates, second gets dashed. */
export function buildSeries(
  rows: readonly TimingRow[],
  count: number,
): Series[] {
  const seenTeams = new Set<string>();
  return [...rows]
    .sort((a, b) => a.position - b.position)
    .slice(0, count)
    .map((row) => {
      const dash = seenTeams.has(row.teamName) ? TEAMMATE_DASH : undefined;
      seenTeams.add(row.teamName);
      return {
        driverNumber: row.driverNumber,
        acronym: row.nameAcronym,
        colour: row.teamColour,
        dash,
      };
    });
}

/** Format the gap for the driver */
export function formatGap(sample: Sample, driverNumber: number): string {
  const gap = sample.gaps.get(driverNumber);
  if (gap === undefined) return "-";
  return formatInterval(gap, sample.leader === driverNumber) ?? "-";
}
