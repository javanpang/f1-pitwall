import { describe, expect, it } from "vitest";
import { formatElapsed, positionFromKey, ratioFromPointer } from "./replay.ts";

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

describe("positionFromKey", () => {
  it.each([
    ["ArrowRight", false, 65_000],
    ["ArrowLeft", true, 30_000],
    ["Home", false, 0],
    ["End", false, 3_600_000],
    ["Enter", false, null],
  ])("%s (shift=%s) -> %s", (key, large, expected) =>
    expect(positionFromKey(key, 60_000, 3_600_000, large)).toBe(expected),
  );
});

describe("ratioFromPointer", () => {
  const rect = { left: 100, width: 200 } as DOMRect;
  it("maps and clamps", () => {
    expect(ratioFromPointer(200, rect)).toBe(0.5);
    expect(ratioFromPointer(0, rect)).toBe(0);
    expect(ratioFromPointer(999, rect)).toBe(1);
  });
  it("returns null for a zero-width bar", () => {
    expect(ratioFromPointer(5, { left: 0, width: 0 } as DOMRect)).toBeNull();
  });
});
