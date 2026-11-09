import { describe, expect, it } from "vitest";
import { buildLapGaps } from "./buildLapGaps.js";

const BASE = Date.parse("2026-01-01T12:00:00Z");
const at = (secs) => BASE + secs * 1000;

const entry = (driverNumber, ends) => ({
  driver: { driver_number: driverNumber },
  laps: ends.map((secs, i) => ({
    lapNumber: i + 1,
    endMs: secs === null ? null : at(secs),
  })),
});

describe("buildLapGaps", () => {
  it("measures each car against the first to finish that lap", () => {
    const result = buildLapGaps([
      entry(1, [90, 181]),
      entry(44, [91.5, 180]), // takes the lead on lap 2
    ]);

    expect(result.totalLaps).toBe(2);
    expect(result.laps).toEqual([
      {
        lap: 1,
        at: new Date(at(90)).toISOString(),
        leader: 1,
        gaps: { 1: 0, 44: 1.5 },
      },
      {
        lap: 2,
        at: new Date(at(180)).toISOString(),
        leader: 44,
        gaps: { 1: 1, 44: 0 },
      },
    ]);
  });

  it("skips laps with no completion time", () => {
    const result = buildLapGaps([entry(1, [90, null]), entry(44, [92])]);

    expect(result.totalLaps).toBe(1);
    expect(result.laps).toHaveLength(1);
  });

  it("handles a session with no laps", () => {
    expect(buildLapGaps([])).toEqual({ totalLaps: 0, laps: [] });
  });
});
