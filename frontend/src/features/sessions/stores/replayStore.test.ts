import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useReplayStore } from "./replayStore.ts";
import { useReplayPosition } from "../hooks/useReplay.ts";

const DURATION = 60_000;
const store = () => useReplayStore.getState();

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
  });
  store().reset();
  store().setDuration(DURATION);
});

afterEach(() => {
  store().reset();
  vi.useRealTimers();
});

describe("replayStore", () => {
  it("advances by real time x speed while playing", () => {
    store().setSpeed(4);
    store().play();
    vi.advanceTimersByTime(1_600);

    expect(Math.abs(store().position - 6_400)).toBeLessThanOrEqual(64);
  });

  it("keeps its place when the speed changes mid-play", () => {
    store().play();
    vi.advanceTimersByTime(1_600);
    store().setSpeed(4);
    vi.advanceTimersByTime(1_600);

    expect(Math.abs(store().position - 8_000)).toBeLessThanOrEqual(80);
  });

  it("pauses in place", () => {
    store().play();
    vi.advanceTimersByTime(800);
    store().pause();
    const paused = store().position;

    vi.advanceTimersByTime(5_000);

    expect(store().position).toBe(paused);
    expect(store().playing).toBe(false);
  });

  it("stops at the end, then restarts from 0 on play", () => {
    store().play();
    vi.advanceTimersByTime(DURATION + 1_000);
    expect(store()).toMatchObject({ position: DURATION, playing: false });
    expect(vi.getTimerCount()).toBe(0);

    store().play();
    expect(store()).toMatchObject({ position: 0, playing: true });
  });

  it("clamps seeks, and clamps position when the duration shrinks", () => {
    store().seek(-1);
    expect(store().position).toBe(0);
    store().seek(DURATION + 1);
    expect(store().position).toBe(DURATION);

    store().seek(50_000);
    store().setDuration(30_000);
    expect(store().position).toBe(30_000);
  });

  it("won't play with no duration", () => {
    store().setDuration(0);
    store().play();
    expect(store().playing).toBe(false);
  });

  it("reset stops the loop and restores the initial state", () => {
    store().setSpeed(8);
    store().play();
    store().reset();

    expect(store()).toMatchObject({
      position: 0,
      duration: 0,
      playing: false,
      speed: 1,
    });
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("useReplayPosition", () => {
  it("quantized subscribers re-render far less than per-frame ones", () => {
    let perFrame = 0;
    let perSecond = 0;
    renderHook(() => {
      perFrame++;
      return useReplayPosition();
    });
    renderHook(() => {
      perSecond++;
      return useReplayPosition(1_000);
    });

    act(() => store().play());

    const FRAME_MS = 16;
    for (let t = 0; t < 3_200; t += FRAME_MS) {
      act(() => {
        vi.advanceTimersByTime(FRAME_MS);
      });
    }

    expect(perFrame).toBeGreaterThan(100);
    expect(perSecond).toBeLessThan(perFrame / 10);
  });
});
