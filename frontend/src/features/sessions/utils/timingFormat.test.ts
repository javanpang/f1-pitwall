import { describe, expect, it } from "vitest";
import { formatInterval, formatLapTime, formatSector } from "./timingFormat";

describe("formatLapTime", () => {
  it("formats minutes, seconds and padded milliseconds", () => {
    expect(formatLapTime(84.387)).toBe("1:24.387");
    expect(formatLapTime(60.005)).toBe("1:00.005");
  });
  it("does not produce 60 seconds from float rounding", () => {
    expect(formatLapTime(59.9996)).toBe("1:00.000");
  });
  it("returns a dash for missing times", () => {
    expect(formatLapTime(null)).toBe("-");
  });
});

describe("formatSector", () => {
  it("always shows three decimals", () => {
    expect(formatSector(28.4)).toBe("28.400");
    expect(formatSector(null)).toBe("-");
  });
});

describe("formatInterval", () => {
  it("shows LEADER for null and a plus-prefixed gap otherwise", () => {
    expect(formatInterval(null)).toBe("LEADER");
    expect(formatInterval(0.482)).toBe("+0.482");
  });
});
