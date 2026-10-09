import { describe, expect, it } from "vitest";
import { formatDateRange, formatTime, formatWhen } from "./date.ts";

describe("formatDateRange", () => {
  it("collapses a range within one month", () => {
    expect(
      formatDateRange("2026-06-01T00:00:00Z", "2026-06-03T23:59:00Z"),
    ).toBe("1-3 Jun");
  });

  it("shows both months when the weekend crosses a month boundary", () => {
    expect(
      formatDateRange("2026-02-28T00:00:00Z", "2026-03-02T23:59:00Z"),
    ).toBe("28 Feb - 2 Mar");
  });

  it("handles a range crossing the new year", () => {
    expect(
      formatDateRange("2025-12-31T00:00:00Z", "2026-01-02T23:59:00Z"),
    ).toBe("31 Dec - 2 Jan");
  });

  it("uses UTC days, not the machine's local timezone", () => {
    expect(
      formatDateRange("2026-03-06T23:30:00Z", "2026-03-08T00:30:00Z"),
    ).toBe("6-8 Mar");
  });
});

describe("formatTime", () => {
  it("formats as HH:mm UTC", () => {
    expect(formatTime("2026-03-08T14:00:00Z")).toBe("14:00 UTC");
  });

  it("zero-pads hours and minutes", () => {
    expect(formatTime("2026-03-08T09:05:00Z")).toBe("09:05 UTC");
  });

  it("renders midnight as 00:00, not 24:00", () => {
    expect(formatTime("2026-03-08T00:00:00Z")).toBe("00:00 UTC");
  });
});

describe("formatWhen", () => {
  it("combines day and time", () => {
    expect(formatWhen("2026-03-08T14:00:00Z")).toMatch(
      /^Sun,? 8 Mar · 14:00 UTC$/,
    );
  });
});
