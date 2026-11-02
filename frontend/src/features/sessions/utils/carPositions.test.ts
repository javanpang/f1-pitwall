import { describe, expect, it } from "vitest";
import type { CarSample } from "../types.ts";
import { interpolatePosition } from "./carPositions.ts";

const samples: CarSample[] = [
  [-500, 0, 0],
  [0, 10, 20],
  [1_000, 20, 40],
  [10_000, 30, 60],
];

describe("interpolatePosition", () => {
  it("interpolates between surrounding samples", () => {
    expect(interpolatePosition(samples, 500)).toEqual({ x: 15, y: 30 });
  });

  it("uses lead-in samples before the chunk starts", () => {
    expect(interpolatePosition(samples, -250)).toEqual({ x: 5, y: 10 });
  });

  it("returns an exact sample position", () => {
    expect(interpolatePosition(samples, 0)).toEqual({ x: 10, y: 20 });
  });

  it("hides cars across a telemetry gap", () => {
    expect(interpolatePosition(samples, 5_000)).toBeNull();
  });

  it("holds the last position briefly, then hides the car", () => {
    expect(interpolatePosition(samples, 12_000)).toEqual({ x: 30, y: 60 });
    expect(interpolatePosition(samples, 20_000)).toBeNull();
  });

  it("returns null before the first sample or with no samples", () => {
    expect(interpolatePosition(samples, -1_000)).toBeNull();
    expect(interpolatePosition([], 0)).toBeNull();
  });
});
