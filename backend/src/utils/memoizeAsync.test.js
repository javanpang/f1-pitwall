import { describe, beforeEach, afterEach, it, vi, expect } from "vitest";
import { memoizeAsync } from "./memoizeAsync";

describe("memoizeAsync", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("calls the underlying function for repeated calls with the same arguments", async () => {
    const fn = vi.fn().mockResolvedValue("data");
    const memo = memoizeAsync(fn, { ttlMs: 1000 });

    await memo({ year: 2026 });
    await memo({ year: 2026 });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("deduplicates concurrent in-flight calls", async () => {
    const fn = vi.fn().mockResolvedValue("data");
    const memo = memoizeAsync(fn, { ttlMs: 1000 });

    const [a, b] = await Promise.all([
      memo({ year: 2026 }),
      memo({ year: 2026 }),
    ]);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it("treats different arguments as different cache entries", async () => {
    const fn = vi.fn().mockResolvedValue("data");
    const memo = memoizeAsync(fn, { ttlMs: 1000 });

    await memo({ year: 2026 });
    await memo({ year: 2027 });

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not cache failures", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429 Too Many Requests"))
      .mockResolvedValue("ok");
    const memo = memoizeAsync(fn, { ttlMs: 1000 });

    await expect(memo()).rejects.toThrow("429");
    await expect(memo()).resolves.toBe("ok");

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("calls the function again after the TTL expires", async () => {
    const fn = vi.fn().mockResolvedValue("data");
    const memo = memoizeAsync(fn, { ttlMs: 1000 });

    await memo();
    vi.advanceTimersByTime(999);
    await memo();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2);
    await memo();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
