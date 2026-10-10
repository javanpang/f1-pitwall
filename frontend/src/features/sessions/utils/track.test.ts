import { describe, expect, it } from "vitest";
import { buildTrackGeometry } from "./track.ts";

describe("buildTrackGeometry", () => {
  it("returns null when there aren't enough points to draw", () => {
    expect(buildTrackGeometry([])).toBeNull();
    expect(buildTrackGeometry([{ x: 1, y: 1 }])).toBeNull();
  });

  it("builds a closed path starting at the first point", () => {
    const g = buildTrackGeometry([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);
    expect(g?.path).toBe("M0 0 L10 0 L10 -10 Z");
  });

  it("flips y so higher telemetry y renders higher on screen", () => {
    const g = buildTrackGeometry([
      { x: 0, y: 0 },
      { x: 0, y: 10 },
    ]);
    expect(g?.path).toBe("M0 0 L0 -10 Z");
  });

  it("pads the viewBox uniformly around the bounds", () => {
    const g = buildTrackGeometry(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      0.05,
    );
    // after flip: x 0..10, y -10..0 -> pad = 0.5
    expect(g?.viewBox).toBe("-0.5 -10.5 11 11");
  });

  it("reports the start position in SVG coordinates", () => {
    const g = buildTrackGeometry([
      { x: 5, y: 2 },
      { x: 9, y: 9 },
    ]);
    expect(g?.start).toEqual({ x: 5, y: -2 });
  });
});
