import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../clients/openf1Client.js", () => ({
  getSessions: vi.fn(),
}));

import { getSessions } from "../clients/openf1Client.js";
import {
  FINISHED_GRACE_MS,
  cacheWhenFinished,
  findSession,
  isSessionFinished,
} from "./sessionCache.js";

const END = Date.parse("2026-01-01T14:00:00Z");
const session = { session_key: 1, date_end: new Date(END).toISOString() };

beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.useRealTimers());

describe("isSessionFinished", () => {
  it("is unfinished at the scheduled end, while a red-flagged race may still be running", () => {
    expect(isSessionFinished(session, END + 1)).toBe(false);
  });

  it("is unfinished right up to the end of the grace period", () => {
    expect(isSessionFinished(session, END + FINISHED_GRACE_MS)).toBe(false);
  });

  it("is finished once the grace period has passed", () => {
    expect(isSessionFinished(session, END + FINISHED_GRACE_MS + 1)).toBe(true);
  });

  it.each([null, {}, { date_end: null }, { date_end: "not a date" }])(
    "treats a session with no usable end (%o) as unfinished",
    (s) => {
      expect(isSessionFinished(s, END + 10 * FINISHED_GRACE_MS)).toBe(false);
    },
  );
});

describe("findSession", () => {
  it("returns the session", async () => {
    getSessions.mockResolvedValue([session]);
    await expect(findSession(1)).resolves.toBe(session);
    expect(getSessions).toHaveBeenCalledWith({ session_key: 1 });
  });

  it("404s when the session does not exist", async () => {
    getSessions.mockResolvedValue([]);
    await expect(findSession(1)).rejects.toMatchObject({ status: 404 });
  });
});

describe("cacheWhenFinished", () => {
  it("caches finished sessions per argument list", async () => {
    vi.useFakeTimers({ now: END + FINISHED_GRACE_MS + 1 });
    getSessions.mockResolvedValue([session]);
    const load = vi.fn(async (key, from) => `${key}@${from}`);
    const get = cacheWhenFinished(load);

    await expect(get(1, 0)).resolves.toEqual({
      session,
      finished: true,
      data: "1@0",
    });
    await get(1, 0);
    await get(1, 60);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it("always loads fresh during the grace period", async () => {
    vi.useFakeTimers({ now: END + 60_000 });
    getSessions.mockResolvedValue([session]);
    const load = vi.fn(async () => "data");
    const get = cacheWhenFinished(load);

    const result = await get(1);
    await get(1);

    expect(result.finished).toBe(false);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("does not load when the session does not exist", async () => {
    getSessions.mockResolvedValue([]);
    const load = vi.fn();

    await expect(cacheWhenFinished(load)(1)).rejects.toMatchObject({
      status: 404,
    });
    expect(load).not.toHaveBeenCalled();
  });
});
