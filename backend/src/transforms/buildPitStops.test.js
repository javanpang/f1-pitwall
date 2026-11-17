import { describe, expect, it } from "vitest";
import { buildPitStops } from "./buildPitStops.js";

const BASE = Date.parse("2026-01-01T12:00:00Z");
const at = (secs) => BASE + secs * 1000;
const iso = (secs) => new Date(at(secs)).toISOString();

const entry = (overrides = {}) => ({
  driver: { driver_number: 1, name_acronym: "VER", team_colour: "3671C6" },
  positions: [
    { t: at(0), value: 3 },
    { t: at(80), value: 2 },
    { t: at(130), value: 7 }, // drops on pit entry, before the pit record
    { t: at(240), value: 5 },
    { t: at(260), value: 4 },
  ],
  laps: [
    { lapNumber: 1, endMs: at(85) },
    { lapNumber: 2, endMs: at(150) },
    { lapNumber: 3, endMs: at(250) },
    { lapNumber: 4, endMs: at(290) },
  ],
  stints: [
    { stint_number: 1, lap_start: 1, compound: "SOFT", tyre_age_at_start: 0 },
    { stint_number: 2, lap_start: 3, compound: "HARD", tyre_age_at_start: 3 },
  ],
  pits: [
    {
      t: at(140),
      value: { lapNumber: 2, stopSeconds: 2.4, laneSeconds: 21.9 },
    },
  ],
  ...overrides,
});

describe("buildPitStops", () => {
  it("records the tyre change and positions around a stop", () => {
    expect(buildPitStops([entry()])).toEqual([
      {
        id: "1-0",
        date: iso(140),
        lapNumber: 2,
        driver: { number: 1, acronym: "VER", teamColour: "#3671C6" },
        tyreFrom: { compound: "SOFT", ageLaps: 0 },
        tyreTo: { compound: "HARD", ageLaps: 3 },
        stopSeconds: 2.4,
        laneSeconds: 21.9,
        positionBefore: 2,
        positionAfter: 5,
        settledAt: iso(250),
      },
    ]);
  });

  it("leaves unknowns null when the stint or out-lap is missing", () => {
    const [stop] = buildPitStops([
      entry({
        stints: [entry().stints[0]],
        laps: [{ lapNumber: 1, endMs: at(85) }],
      }),
    ]);

    expect(stop.tyreTo).toBeNull();
    expect(stop.positionAfter).toBeNull();
    expect(stop.settledAt).toBeNull();
  });

  it("orders stops across drivers by time", () => {
    const other = entry({
      driver: { driver_number: 44, name_acronym: "HAM", team_colour: null },
      pits: [
        {
          t: at(50),
          value: { lapNumber: 1, stopSeconds: null, laneSeconds: null },
        },
      ],
    });

    const stops = buildPitStops([entry(), other]);

    expect(stops.map((s) => s.driver.acronym)).toEqual(["HAM", "VER"]);
    expect(stops[0].driver.teamColour).toBe("#9CA3AF");
  });
});
