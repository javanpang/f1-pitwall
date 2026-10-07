import { vi, describe, beforeEach, it, expect } from "vitest";

vi.mock("../clients/openf1Client.js", () => ({
  getMeetings: vi.fn(),
  getSessions: vi.fn(),
}));

import { getMeetings, getSessions } from "../clients/openf1Client.js";
import { getSeason } from "./seasonService.js";

const meeting = (key, name, start) => ({
  meeting_key: key,
  meeting_name: name,
  date_start: start,
  date_end: start,
});

const session = (key, meetingKey, name, start) => ({
  session_key: key,
  meeting_key: meetingKey,
  session_name: name,
  session_type: "Race",
  date_start: start,
  date_end: start,
});

describe("getSeason", () => {
  beforeEach(() => vi.resetAllMocks());

  it("groups sessions under their meeting, with both lists in date order", async () => {
    getMeetings.mockResolvedValue([
      meeting(2, "Chinese Grand Prix", "2026-03-13T00:00:00Z"),
      meeting(1, "Australian Grand Prix", "2026-03-06T00:00:00Z"),
    ]);
    getSessions.mockResolvedValue([
      session(22, 2, "Race", "2026-03-15T14:00:00Z"),
      session(11, 1, "Race", "2026-03-08T14:00:00Z"),
      session(21, 2, "Practice 1", "2026-03-13T11:00:00Z"),
    ]);

    const result = await getSeason(2026);

    expect(result.map((r) => r.meeting.key)).toEqual([1, 2]);
    expect(result[1].sessions.map((s) => s.key)).toEqual([21, 22]);
  });

  it("makes exactly one upstream call per resource, not one per meeting", async () => {
    getMeetings.mockResolvedValue([
      meeting(1, "A", "2026-03-06T00:00:00Z"),
      meeting(2, "B", "2026-03-13T00:00:00Z"),
    ]);
    getSessions.mockResolvedValue([]);

    await getSeason(2026);

    expect(getMeetings).toHaveBeenCalledTimes(1);
    expect(getMeetings).toHaveBeenCalledWith({ year: 2026 });
    expect(getSessions).toHaveBeenCalledTimes(1);
    expect(getSessions).toHaveBeenCalledWith({ year: 2026 });
  });

  it("excludes pre-season testing", async () => {
    getMeetings.mockResolvedValue([
      meeting(1, "Pre-Season Testing", "2026-02-18T00:00:00Z"),
      meeting(2, "Australian Grand Prix", "2026-03-06T00:00:00Z"),
    ]);
    getSessions.mockResolvedValue([]);

    const result = await getSeason(2026);

    expect(result.map((r) => r.meeting.key)).toEqual([2]);
  });

  it("returns an empty list when the season has no meetings", async () => {
    getMeetings.mockResolvedValue([]);
    getSessions.mockResolvedValue([]);

    expect(await getSeason(2026)).toEqual([]);
  });

  it("gives a meeting with no sessions an empty sessions array", async () => {
    getMeetings.mockResolvedValue([meeting(1, "A", "2026-03-06T00:00:00Z")]);
    getSessions.mockResolvedValue([]);

    const [round] = await getSeason(2026);

    expect(round.sessions).toEqual([]);
  });
});
