import { describe, expect, it } from "vitest";
import type { PitStop } from "../types";
import { formatPitDuration, pitStopsUpTo, positionDelta } from "./pitStops";

const BASE = Date.parse("2026-01-01T12:00:00Z");
const iso = (secs: number) => new Date(BASE + secs * 1000).toISOString();

const stop = (overrides: Partial<PitStop> = {}): PitStop => ({
  id: "1-0",
  date: iso(100),
  lapNumber: 10,
  driver: { number: 1, acronym: "VER", teamColour: "#3671C6" },
  tyreFrom: { compound: "SOFT", ageLaps: 0 },
  tyreTo: { compound: "HARD", ageLaps: 0 },
  stopSeconds: 2.43,
  laneSeconds: 21.9,
  positionBefore: 2,
  positionAfter: 5,
  settledAt: iso(200),
  ...overrides,
});

describe("pitStopsUpTo", () => {
  it("returns stops so far, newest first", () => {
    const stops = [
      stop({ id: "a", date: iso(10) }),
      stop({ id: "b", date: iso(20) }),
      stop({ id: "c", date: iso(30) }),
    ];

    expect(pitStopsUpTo(stops, BASE + 20_000).map((s) => s.id)).toEqual([
      "b",
      "a",
    ]);
  });
});

describe("positionDelta", () => {
  it("is unknown until the out-lap is complete", () => {
    expect(positionDelta(stop(), BASE + 150_000)).toBeNull();
  });

  it("reports places lost as negative", () => {
    expect(positionDelta(stop(), BASE + 200_000)).toBe(-3);
  });

  it("reports places gained as positive", () => {
    expect(
      positionDelta(stop({ positionBefore: 6, positionAfter: 4 }), BASE + 1e6),
    ).toBe(2);
  });

  it("is unknown without positions", () => {
    expect(positionDelta(stop({ positionAfter: null }), BASE + 1e6)).toBeNull();
  });
});

describe("formatPitDuration", () => {
  it("prefers stationary time", () => {
    expect(formatPitDuration(stop())).toBe("2.4s");
  });

  it("falls back to pit lane time", () => {
    expect(formatPitDuration(stop({ stopSeconds: null }))).toBe("21.9s");
  });

  it("is null with neither", () => {
    expect(
      formatPitDuration(stop({ stopSeconds: null, laneSeconds: null })),
    ).toBeNull();
  });
});
