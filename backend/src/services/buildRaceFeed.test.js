import { describe, expect, it } from "vitest";
import { buildRaceFeed, classifyRaceControl } from "./buildRaceFeed.js";

const rc = (date, extra = {}) => ({
  date,
  category: "Other",
  flag: null,
  lap_number: 1,
  driver_number: null,
  message: "MESSAGE",
  ...extra,
});

const drivers = [
  { driver_number: 44, name_acronym: "HAM", team_colour: "E80020" },
  { driver_number: 1, name_acronym: "VER", team_colour: null },
];

describe("classifyRaceControl", () => {
  it.each([
    [{ category: "Flag" }, "flag"],
    [{ category: "SafetyCar" }, "safety-car"],
    [{ category: "Drs" }, "drs"],
    [{ category: "SessionStatus" }, "session"],
    [{ category: "CarEvent" }, "other"],
    [
      { category: "Other", message: "FIA STEWARDS: 5 SECOND TIME PENALTY" },
      "steward",
    ],
  ])("classifies %o as %s", (record, kind) => {
    expect(classifyRaceControl(record)).toBe(kind);
  });
});

describe("buildRaceFeed", () => {
  it("merges race control and pit stops in time order", () => {
    const events = buildRaceFeed({
      raceControl: [
        rc("2026-01-01T12:10:00Z", { message: "LATE" }),
        rc("2026-01-01T12:00:00Z", { message: "EARLY" }),
      ],
      pits: [
        { date: "2026-01-01T12:05:00+00:00", driver_number: 44, lap_number: 3 },
      ],
      drivers,
    });

    expect(events.map((e) => e.kind)).toEqual(["other", "pit", "other"]);
    expect(events.map((e) => e.date)).toEqual([
      "2026-01-01T12:00:00.000Z",
      "2026-01-01T12:05:00.000Z",
      "2026-01-01T12:10:00.000Z",
    ]);
  });

  it("attaches driver details, with a fallback team colour", () => {
    const [ham, ver, unknown] = buildRaceFeed({
      raceControl: [
        rc("2026-01-01T12:00:00Z", { driver_number: 44 }),
        rc("2026-01-01T12:01:00Z", { driver_number: 1 }),
        rc("2026-01-01T12:02:00Z", { driver_number: 99 }),
      ],
      drivers,
    });

    expect(ham.driver).toEqual({
      number: 44,
      acronym: "HAM",
      teamColour: "#E80020",
    });
    expect(ver.driver.teamColour).toBe("#9CA3AF");
    expect(unknown.driver).toBeNull();
  });

  it("describes pit stops from the stationary and pit lane times", () => {
    const [full, laneOnly] = buildRaceFeed({
      pits: [
        {
          date: "2026-01-01T12:00:00Z",
          stop_duration: 2.43,
          lane_duration: 21.6,
        },
        {
          date: "2026-01-01T12:01:00Z",
          stop_duration: null,
          pit_duration: 22.04,
        },
      ],
    });

    expect(full.message).toBe("PIT STOP - 2.4s stationary - 21.6s in pit lane");
    expect(laneOnly.message).toBe("PIT STOP - 22.0s in pit lane");
  });

  it("drops records without a valid timestamp", () => {
    const events = buildRaceFeed({
      raceControl: [rc(null), rc("not a date"), rc("2026-01-01T12:00:00Z")],
      pits: [{ date: undefined }],
    });

    expect(events).toHaveLength(1);
  });
});
