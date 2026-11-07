import { describe, expect, it } from "vitest";
import {
  buildTimingTowerRows,
  indexTimingData,
} from "./buildTimingTowerRows.js";

const BASE = Date.parse("2026-01-01T12:00:00Z");
const iso = (secs) => new Date(BASE + secs * 1000).toISOString();
const at = (secs) => BASE + secs * 1000;

const driver = (n, extra = {}) => ({
  driver_number: n,
  name_acronym: `D${n}`,
  team_name: "Team",
  team_colour: "FF0000",
  ...extra,
});

const lap = (n, lapNumber, startSecs, duration, sectors) => ({
  driver_number: n,
  lap_number: lapNumber,
  date_start: iso(startSecs),
  lap_duration: duration,
  duration_sector_1: sectors[0],
  duration_sector_2: sectors[1],
  duration_sector_3: sectors[2],
});

// Driver 1 starts P2 and finishes P1; driver 44 the reverse.
function fixture(overrides = {}) {
  return {
    drivers: [driver(1), driver(44)],
    positions: [
      { driver_number: 1, date: iso(0), position: 2 },
      { driver_number: 1, date: iso(200), position: 1 },
      { driver_number: 44, date: iso(0), position: 1 },
      { driver_number: 44, date: iso(200), position: 2 },
    ],
    intervals: [
      { driver_number: 1, date: iso(200), interval: 0 },
      { driver_number: 44, date: iso(200), interval: 3.5 },
    ],
    laps: [
      lap(1, 1, 0, 90, [30, 30, 30]),
      lap(1, 2, 90, 85, [28, 29, 28]), // overall best lap
      lap(44, 1, 0, 88, [29, 30, 29]),
      lap(44, 2, 88, 92, [31, 31, 30]),
    ],
    stints: [
      {
        driver_number: 1,
        stint_number: 1,
        lap_start: 1,
        compound: "soft",
        tyre_age_at_start: 0,
      },
    ],
    pits: [{ driver_number: 44, date: iso(150) }],
    ...overrides,
  };
}

const build = (data, time = null) =>
  buildTimingTowerRows(indexTimingData(data), time);
const byDriver = (rows, n) => rows.find((r) => r.driverNumber === n);

describe("buildTimingTowerRows", () => {
  it("orders by latest position and flags movement against the first record", () => {
    const rows = build(fixture());

    expect(rows.map((r) => r.driverNumber)).toEqual([1, 44]);
    expect(rows[0].positionChange).toBe("up");
    expect(rows[1].positionChange).toBe("down");
  });

  it("gives the leader no interval, and followers their latest gap", () => {
    const rows = build(fixture());

    expect(byDriver(rows, 1).intervalSeconds).toBeNull();
    expect(byDriver(rows, 44).intervalSeconds).toBe(3.5);
  });

  it("marks overall-best and personal-best laps", () => {
    const rows = build(fixture());

    expect(byDriver(rows, 1).lastLap.status).toBe("overall-best");
    expect(byDriver(rows, 1).bestLap.status).toBe("overall-best");
    expect(byDriver(rows, 44).bestLap).toEqual({
      seconds: 88,
      status: "personal-best",
    });
    expect(byDriver(rows, 44).lastLap.status).toBe("default");
  });

  describe("replaying at a point in time", () => {
    it("only shows laps and positions that had happened by then", () => {
      // t=100s: lap 1 is done for both, lap 2 is not, and no overtake yet
      const rows = build(fixture(), at(100));

      expect(rows.map((r) => r.driverNumber)).toEqual([44, 1]);
      expect(byDriver(rows, 1).lastLap.seconds).toBe(90);
      expect(byDriver(rows, 1).positionChange).toBe("none");
      expect(byDriver(rows, 44).pitStops).toBe(0);
    });

    it("recomputes overall bests as of that moment", () => {
      const rows = build(fixture(), at(100));

      expect(byDriver(rows, 44).lastLap.status).toBe("overall-best");
      expect(byDriver(rows, 1).lastLap.status).toBe("personal-best");
    });

    it("counts pit stops only once they have happened", () => {
      expect(byDriver(build(fixture(), at(149)), 44).pitStops).toBe(0);
      expect(byDriver(build(fixture(), at(151)), 44).pitStops).toBe(1);
    });

    it("returns no rows before any position data exists", () => {
      expect(build(fixture(), at(-60))).toEqual([]);
    });
  });

  it("skips drivers with no position data", () => {
    const data = fixture({ drivers: [driver(1), driver(44), driver(99)] });

    expect(build(data).map((r) => r.driverNumber)).not.toContain(99);
  });

  it("falls back to a neutral colour when the team colour is missing", () => {
    const data = fixture({
      drivers: [driver(1, { team_colour: undefined }), driver(44)],
    });

    expect(byDriver(build(data), 1).teamColour).toBe("#9CA3AF");
  });

  it("counts completed untimed laps towards tyre age", () => {
    const data = fixture({
      laps: [
        lap(1, 1, 0, null, [null, null, null]),
        lap(1, 2, 90, 85, [28, 29, 28]),
      ],
    });
    const row = byDriver(build(data, at(100)), 1);

    expect(row.lastLap.seconds).toBeNull();
    expect(row.tyre).toEqual({ compound: "SOFT", ageLaps: 0 });
  });

  it("reports 'default' best-lap status and null tyre when a driver has no data", () => {
    const row = byDriver(build(fixture({ laps: [], stints: [] })), 1);

    expect(row.bestLap).toEqual({ seconds: null, status: "default" });
    expect(row.tyre).toEqual({ compound: "UNKNOWN", ageLaps: null });
  });
});
