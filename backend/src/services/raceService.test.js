import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./openf1Service.js", () => ({
  getMeetings: vi.fn(),
  getSessions: vi.fn(),
}));

import { getMeetings, getSessions } from "./openf1Service.js";
import {
  getRaceWeekend,
  resolveActiveSessions,
  resolveTargetMeeting,
} from "./raceService.js";

const meeting = (key, start, end) => ({
  meeting_key: key,
  meeting_name: `Meeting ${key}`,
  date_start: start,
  date_end: end,
});

const session = (key, name, start, end) => ({
  session_key: key,
  session_name: name,
  date_start: start,
  date_end: end,
});

const FP1 = session(
  1,
  "Practice 1",
  "2026-01-01T11:00:00Z",
  "2026-01-01T12:00:00Z",
);
const QUALI = session(
  2,
  "Qualifying",
  "2026-01-02T15:00:00Z",
  "2026-01-02T16:00:00Z",
);
const RACE = session(3, "Race", "2026-01-03T14:00:00Z", "2026-01-03T16:00:00Z");
const WEEKEND = [FP1, QUALI, RACE];

describe("resolveActiveSessions", () => {
  it("before any session: next is the first, nothing has finished", () => {
    const result = resolveActiveSessions(
      WEEKEND,
      new Date("2026-01-01T00:00:00Z"),
    );

    expect(result.status).toBe("between_sessions");
    expect(result.activeSession).toBeNull();
    expect(result.nextSession).toEqual(FP1);
    expect(result.lastSession).toBeNull();
  });

  it("during a session: reports it live, with next and last sessions around it", () => {
    const result = resolveActiveSessions(
      WEEKEND,
      new Date("2026-01-02T15:30:00Z"),
    );

    expect(result.status).toBe("session_live");
    expect(result.activeSession).toEqual(QUALI);
    expect(result.nextSession).toEqual(RACE);
    expect(result.lastSession).toEqual(FP1);
  });

  it("after the final session: weekend is over", () => {
    const result = resolveActiveSessions(
      WEEKEND,
      new Date("2026-01-03T17:00:00Z"),
    );

    expect(result.status).toBe("weekend_over");
    expect(result.activeSession).toBeNull();
    expect(result.nextSession).toBeNull();
    expect(result.lastSession).toEqual(RACE);
  });

  it("never reports a session with no end date as live, and does not crash", () => {
    const noEnd = session(9, "Mystery", "2026-01-02T15:00:00Z", null);

    const result = resolveActiveSessions(
      [noEnd],
      new Date("2026-01-02T15:30:00Z"),
    );

    expect(result.activeSession).toBeNull();
  });

  it("does not depend on input order and does not mutate the input", () => {
    const shuffled = [RACE, FP1, QUALI];

    const result = resolveActiveSessions(
      shuffled,
      new Date("2026-01-01T20:00:00Z"),
    );

    expect(result.nextSession).toBe(QUALI);
    expect(shuffled).toEqual([RACE, FP1, QUALI]);
  });

  describe("resolveTargetMeeting", () => {
    const meeting1 = meeting(1, "2026-01-02T00:00:00Z", "2026-01-04T23:59:00Z"); // 2/1 12am - 4/1 11:59pm
    const meeting2 = meeting(2, "2026-02-06T00:00:00Z", "2026-02-08T23:59:00Z"); // 6/2 12am - 8/2 11:59pm
    const meeting3 = meeting(3, "2026-03-10T00:00:00Z", "2026-03-12T23:59:00Z"); // 10/3 12am - 12/3 11:59pm
    const SEASON = [meeting1, meeting2, meeting3];

    it("before the season: the first meeting is upcoming", () => {
      const result = resolveTargetMeeting(
        SEASON,
        new Date("2026-01-01T00:00:00Z"),
      );
      expect(result).toEqual({ meeting: meeting1, status: "upcoming" });
    });

    it("during a meeting: it is live", () => {
      const result = resolveTargetMeeting(
        SEASON,
        new Date("2026-02-07T12:00:00Z"),
      );
      expect(result).toEqual({ meeting: meeting2, status: "live" });
    });

    it("between meetings: the next meeting is upcoming", () => {
      const result = resolveTargetMeeting(
        SEASON,
        new Date("2026-02-05T00:00:00Z"),
      );
      expect(result).toEqual({ meeting: meeting2, status: "upcoming" });
    });

    it("after the last meeting: season is over and the last meeting is returned", () => {
      const result = resolveTargetMeeting(
        SEASON,
        new Date("2026-03-13T00:00:00Z"),
      );
      expect(result).toEqual({ meeting: meeting3, status: "season_over" });
    });

    it("handles unsorted input", () => {
      const result = resolveTargetMeeting(
        [meeting3, meeting1, meeting2],
        new Date("2026-01-01T00:00:00Z"),
      );
      expect(result.meeting).toBe(meeting1);
    });
  });

  describe("getRaceWeekend", () => {
    beforeEach(() => vi.resetAllMocks());

    it("falls back to the previous year if the new season has no meetings yet", async () => {
      const lastYear = meeting(
        1,
        "2025-01-01T00:00:00Z",
        "2025-01-03T23:59:00Z",
      );
      getMeetings.mockResolvedValueOnce([]).mockResolvedValueOnce([lastYear]);
      getSessions.mockResolvedValue([]);

      const result = await getRaceWeekend(new Date("2026-01-01T00:00:00Z"));

      expect(getMeetings).toHaveBeenNthCalledWith(1, { year: 2026 });
      expect(getMeetings).toHaveBeenNthCalledWith(2, { year: 2025 });
      expect(result.status).toBe("season_over");
    });

    it("returns null when no meetings exist for either year", async () => {
      getMeetings.mockResolvedValue([]);

      expect(await getRaceWeekend(new Date("2026-01-01T00:00:00Z"))).toBeNull();
    });

    it("combines meeting and session status and shapes the response", async () => {
      getMeetings.mockResolvedValue([
        meeting(1, "2026-01-01T00:00:00Z", "2026-01-03T23:59:00Z"),
      ]);
      getSessions.mockResolvedValue(WEEKEND);

      const result = await getRaceWeekend(new Date("2026-01-02T15:30:00Z"));

      expect(getSessions).toHaveBeenCalledWith({ meeting_key: 1 });
      expect(result.status).toBe("session_live");
      expect(result.activeSession).toMatchObject({
        key: 2,
        name: "Qualifying",
      });
      expect(result.sessions).toHaveLength(3);
    });
  });
});
