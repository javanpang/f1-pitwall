import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useNow } from "./useNow.ts";

describe("useNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-07T12:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("starts at the current time and ticks on the interval", () => {
    const { result } = renderHook(() => useNow(30_000));
    const initial = result.current;

    act(() => vi.advanceTimersByTime(30_000));

    expect(result.current).toBe(initial + 30_000);
  });

  it("clears its interval on unmount (no leaked timers)", () => {
    const { unmount } = renderHook(() => useNow(30_000));
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
