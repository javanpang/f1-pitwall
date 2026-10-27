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

  it("shares one entry between calls whose custom keys match", async () => {
    const fn = vi.fn().mockResolvedValue("data");
    const memo = memoizeAsync(fn, {
      ttlMs: 1000,
      key: ({ circuit }) => circuit,
    });

    await memo({ circuit: 1, session: "a" });
    await memo({ circuit: 1, session: "b" });
    await memo({ circuit: 2, session: "a" });

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("keeps a newer entry when an expired in-flight call rejects late", async () => {
    let rejectFirst;
    const fn = vi
      .fn()
      .mockImplementationOnce(
        () => new Promise((_, reject) => (rejectFirst = reject)),
      )
      .mockResolvedValue("fresh");
    const memo = memoizeAsync(fn, { ttlMs: 1000 });

    const first = memo();
    vi.advanceTimersByTime(1001);
    await memo();

    rejectFirst(new Error("late"));
    await expect(first).rejects.toThrow("late");

    await memo();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("moves a refreshed key to the back of the eviction order", async () => {
    const fn = vi.fn(async (id) => id);
    const memo = memoizeAsync(fn, { ttlMs: 1000, maxEntries: 2 });

    await memo("a");
    vi.advanceTimersByTime(500);
    await memo("b");
    vi.advanceTimersByTime(501);
    await memo("a"); // "a" expired and is refreshed
    await memo("c"); // over capacity: "b" is now the oldest

    fn.mockClear();
    await memo("a");
    expect(fn).not.toHaveBeenCalled();
  });
});
