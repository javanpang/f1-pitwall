import { describe, expect, it } from "vitest";
import type {
  Meeting,
  Session,
  SessionType,
} from "../../../shared/types/f1.ts";
import type { Round } from "../types.ts";
import {
  SESSION_COLUMNS,
  filterByType,
  findFeaturedRound,
  getSessionStatus,
  getVisibleColumns,
  withRounds,
} from "./season.ts";

// Fixtures: factories to only test states that matter
const meeting = (key: number, start: string): Meeting => ({
  key,
  name: `GP ${key}`,
  officialName: null,
  circuit: null,
  country: "Country",
  location: "Location",
  dateStart: start,
  dateEnd: start,
  year: 2026,
});

const session = (
  key: number,
  type: SessionType,
  start: string,
  end: string | null = start,
  name: string = type,
): Session => ({ key, name, type, dateStart: start, dateEnd: end });

const round = (key: number, n: number, sessions: Session[]): Round => ({
  meeting: meeting(key, "2026-03-06T00:00:00Z"),
  sessions,
  round: n,
});

const NOW = Date.parse("2026-03-07T12:00:00Z");

describe("withRounds", () => {
  it("numbers rounds chronologically but returns newest first", () => {
    const input = [
      { meeting: meeting(2, "2026-03-13T00:00:00Z"), sessions: [] },
      { meeting: meeting(1, "2026-03-06T00:00:00Z"), sessions: [] },
    ];

    const result = withRounds(input);

    expect(result.map((r) => [r.meeting.key, r.round])).toEqual([
      [2, 2],
      [1, 1],
    ]);
  });

  it("does not mutate its input", () => {
    const input = [
      { meeting: meeting(2, "2026-03-13T00:00:00Z"), sessions: [] },
      { meeting: meeting(1, "2026-03-06T00:00:00Z"), sessions: [] },
    ];

    withRounds(input);

    expect(input.map((r) => r.meeting.key)).toEqual([2, 1]);
  });
});

describe("filterByType", () => {
  const practiceOnly = round(1, 1, [
    session(1, "Practice", "2026-03-06T11:00:00Z"),
  ]);
  const fullWeekend = round(2, 2, [
    session(2, "Practice", "2026-03-13T11:00:00Z"),
    session(3, "Race", "2026-03-15T14:00:00Z"),
  ]);

  it("returns everything for 'all'", () => {
    expect(filterByType([practiceOnly, fullWeekend], "all")).toHaveLength(2);
  });

  it("keeps rounds that have at least one session of that type", () => {
    const result = filterByType([practiceOnly, fullWeekend], "Race");
    expect(result.map((r) => r.meeting.key)).toEqual([2]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterByType([practiceOnly], "Qualifying")).toEqual([]);
  });
});

describe("getVisibleColumns", () => {
  it("shows every column for 'all'", () => {
    expect(getVisibleColumns("all")).toBe(SESSION_COLUMNS);
  });

  // Sprint and Sprint Qualifying columns sit under Race / Qualifying
  it("groups sprint columns under their parent type", () => {
    expect(getVisibleColumns("Race").map((c) => c.label)).toEqual([
      "Sprint",
      "Race",
    ]);
    expect(getVisibleColumns("Qualifying").map((c) => c.label)).toEqual([
      "Quali",
      "SQ",
    ]);
  });
});

describe("getSessionStatus", () => {
  const s = session(1, "Race", "2026-03-07T12:00:00Z", "2026-03-07T14:00:00Z");
  const start = Date.parse(s.dateStart);
  const end = Date.parse(s.dateEnd!);

  it("is upcoming before the start", () => {
    expect(getSessionStatus(s, start - 1)).toBe("upcoming");
  });

  it("is live from the exact start through the exact end (inclusive)", () => {
    expect(getSessionStatus(s, start)).toBe("live");
    expect(getSessionStatus(s, end)).toBe("live");
  });

  it("is finished after the end", () => {
    expect(getSessionStatus(s, end + 1)).toBe("finished");
  });

  it("never reports a session with no end date as live", () => {
    const noEnd = session(2, "Race", "2026-03-07T12:00:00Z", null);
    expect(getSessionStatus(noEnd, start + 1000)).toBe("finished");
  });
});

describe("findFeaturedRound", () => {
  const finished = session(
    1,
    "Race",
    "2026-03-01T14:00:00Z",
    "2026-03-01T16:00:00Z",
  );
  const live = session(
    2,
    "Race",
    "2026-03-07T11:00:00Z",
    "2026-03-07T13:00:00Z",
  );
  const upcoming = session(
    3,
    "Race",
    "2026-03-14T14:00:00Z",
    "2026-03-14T16:00:00Z",
  );

  it("returns null when every session has finished", () => {
    expect(findFeaturedRound([round(1, 1, [finished])], NOW)).toBeNull();
  });

  it("flags the round with a live session as 'live'", () => {
    const rounds = [
      round(1, 1, [finished]),
      round(2, 2, [live]),
      round(3, 3, [upcoming]),
    ];
    expect(findFeaturedRound(rounds, NOW)).toEqual({ key: 2, kind: "live" });
  });

  it("flags the earliest round with an upcoming session as 'next'", () => {
    const rounds = [
      round(1, 1, [finished]),
      round(2, 2, [upcoming]),
      round(3, 3, [upcoming]),
    ];
    expect(findFeaturedRound(rounds, NOW)).toEqual({ key: 2, kind: "next" });
  });

  it("treats a mid-weekend gap (some finished, some upcoming) as 'next'", () => {
    const rounds = [round(1, 1, [finished, upcoming])];
    expect(findFeaturedRound(rounds, NOW)).toEqual({ key: 1, kind: "next" });
  });

  it("does not depend on input order (the page passes newest-first)", () => {
    const newestFirst = [
      round(3, 3, [upcoming]),
      round(2, 2, [upcoming]),
      round(1, 1, [finished]),
    ];
    expect(findFeaturedRound(newestFirst, NOW)).toEqual({
      key: 2,
      kind: "next",
    });
  });
});
