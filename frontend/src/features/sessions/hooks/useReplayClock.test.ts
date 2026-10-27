import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useReplayClock } from "./useReplayClock.ts";

const DURATION = 60_000;
const FRAME_MS = 16;

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
  });
});
afterEach(() => vi.useRealTimers());

function setup(duration = DURATION) {
  return renderHook(() => useReplayClock(duration));
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function expectPosition(actual: number, expected: number, speed = 1) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(FRAME_MS * speed);
}

describe("useReplayClock", () => {
  it("starts paused at 0 with 1x speed", () => {
    const { result } = setup();

    expect(result.current.position).toBe(0);
    expect(result.current.playing).toBe(false);
    expect(result.current.speed).toBe(1);
  });

  it("does not advance while paused", () => {
    const { result } = setup();

    advance(5_000);

    expect(result.current.position).toBe(0);
  });

  it("advances by real time while playing", () => {
    const { result } = setup();

    act(() => result.current.togglePlay());
    advance(1_600);

    expect(result.current.playing).toBe(true);
    expectPosition(result.current.position, 1_600);
  });

  it("multiplies elapsed time by the selected speed", () => {
    const { result } = setup();

    act(() => result.current.setSpeed(4));
    act(() => result.current.togglePlay());
    advance(1_600);

    expectPosition(result.current.position, 6_400, 4);
  });

  it("keeps its place when the speed changes mid-play", () => {
    const { result } = setup();

    act(() => result.current.togglePlay());
    advance(1_600); // ~1_600 at 1x
    const before = result.current.position;

    act(() => result.current.setSpeed(4));
    advance(1_600); // ~6_400 more at 4x

    expect(result.current.position).toBeGreaterThan(before);
    expectPosition(result.current.position, 1_600 + 6_400, 4);
  });

  it("pauses in place and resumes from where it stopped", () => {
    const { result } = setup();

    act(() => result.current.togglePlay());
    advance(1_600);
    act(() => result.current.togglePlay()); // pause
    const paused = result.current.position;

    advance(5_000);
    expect(result.current.position).toBe(paused);
    expect(result.current.playing).toBe(false);

    act(() => result.current.togglePlay()); // resume
    advance(1_600);
    expectPosition(result.current.position, paused + 1_600);
  });

  it("stops at the end, clamps to the duration and schedules no more frames", () => {
    const { result } = setup();

    act(() => result.current.togglePlay());
    advance(DURATION + 5_000);

    expect(result.current.position).toBe(DURATION);
    expect(result.current.playing).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("restarts from the beginning when play is pressed at the end", () => {
    const { result } = setup();

    act(() => result.current.togglePlay());
    advance(DURATION + 1_000);
    expect(result.current.playing).toBe(false);

    act(() => result.current.togglePlay());

    expect(result.current.position).toBe(0);
    expect(result.current.playing).toBe(true);

    advance(1_600);
    expectPosition(result.current.position, 1_600);
  });

  describe("seek", () => {
    it("moves the position while paused", () => {
      const { result } = setup();

      act(() => result.current.seek(12_000));

      expect(result.current.position).toBe(12_000);
    });

    it("clamps to 0 and to the duration", () => {
      const { result } = setup();

      act(() => result.current.seek(-500));
      expect(result.current.position).toBe(0);

      act(() => result.current.seek(DURATION + 500));
      expect(result.current.position).toBe(DURATION);
    });

    it("continues playing from the new position", () => {
      const { result } = setup();

      act(() => result.current.togglePlay());
      advance(800);
      act(() => result.current.seek(30_000));
      advance(1_600);

      expect(result.current.playing).toBe(true);
      expectPosition(result.current.position, 30_000 + 1_600);
    });
  });

  it("cancels its animation frame on unmount", () => {
    const { result, unmount } = setup();

    act(() => result.current.togglePlay());
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
