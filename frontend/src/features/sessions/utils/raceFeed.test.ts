import { describe, expect, it } from "vitest";
import type { RaceEvent } from "../types";
import { eventMarkerClass, eventsUpTo } from "./raceFeed";

const event = (id: string, date: string, extra: Partial<RaceEvent> = {}) =>
  ({
    id,
    date,
    kind: "other",
    flag: null,
    lapNumber: null,
    message: id,
    driver: null,
    ...extra,
  }) satisfies RaceEvent;

const events = [
  event("a", "2026-01-01T12:00:00.000Z"),
  event("b", "2026-01-01T12:00:10.000Z"),
  event("c", "2026-01-01T12:00:20.000Z"),
];

describe("eventsUpTo", () => {
  it("returns events at or before the time, newest first", () => {
    const at = Date.parse("2026-01-01T12:00:10.000Z");
    expect(eventsUpTo(events, at).map((e) => e.id)).toEqual(["b", "a"]);
  });

  it("returns nothing before the first event and everything after the last", () => {
    expect(eventsUpTo(events, Date.parse("2026-01-01T11:00:00Z"))).toEqual([]);
    expect(eventsUpTo(events, Date.parse("2026-01-01T13:00:00Z"))).toHaveLength(
      3,
    );
  });
});

describe("eventMarkerClass", () => {
  it("colours flags by flag type, falling back for unknown flags", () => {
    expect(
      eventMarkerClass(event("x", "", { kind: "flag", flag: "RED" })),
    ).toBe("bg-red-500");
    expect(
      eventMarkerClass(event("x", "", { kind: "flag", flag: "PURPLE" })),
    ).toBe("bg-muted");
  });
});
