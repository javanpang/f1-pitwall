import { describe, expect, it } from "vitest";
import {
  formatElapsed,
  formatInterval,
  formatLapTime,
  formatSector,
} from "./timingFormat";

describe("formatElapsed", () => {
  it.each([
    [0, "0:00"],
    [65_000, "1:05"],
    [3_725_000, "1:02:05"],
    [-5000, "0:00"],
  ])("formats %i ms as %s", (ms, expected) =>
    expect(formatElapsed(ms)).toBe(expected),
  );
});

describe("formatLapTime", () => {
  it("formats minutes, seconds and padded milliseconds", () => {
    expect(formatLapTime(84.387)).toBe("1:24.387");
    expect(formatLapTime(60.005)).toBe("1:00.005");
    expect(formatLapTime(90)).toBe("1:30.000");
  });

  it("shows 0 minutes for sub-minute times", () => {
    expect(formatLapTime(45.123)).toBe("0:45.123");
  });

  it("does not produce 60 seconds from float rounding", () => {
    expect(formatLapTime(59.9996)).toBe("1:00.000");
  });

  it("returns null for missing times", () => {
    expect(formatLapTime(null)).toBeNull();
  });
});

describe("formatSector", () => {
  it("always shows three decimals", () => {
    expect(formatSector(28.4)).toBe("28.400");
    expect(formatSector(30)).toBe("30.000");
  });

  it("returns null for a missing sector", () => {
    expect(formatSector(null)).toBeNull();
  });
});

describe("formatInterval", () => {
  it("shows LEADER for the leader, even if a gap value is present", () => {
    expect(formatInterval(null, true)).toBe("LEADER");
    expect(formatInterval(1.234, true)).toBe("LEADER");
  });

  it("shows a plus-prefixed gap to 3 decimal places for other drivers", () => {
    expect(formatInterval(0.482, false)).toBe("+0.482");
    expect(formatInterval(12.5, false)).toBe("+12.500");
  });

  it("returns null for a non-leader with no known gap", () => {
    expect(formatInterval(null, false)).toBeNull();
  });
});
