import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../clients/openf1Client.js", () => ({
  getSessions: vi.fn(),
  getDrivers: vi.fn(),
  getLocation: vi.fn(),
}));

import {
  getDrivers,
  getLocation,
  getSessions,
} from "../clients/openf1Client.js";
import { buildCarTracks, getCarPositions } from "./carPositionsService.js";

const FROM = Date.parse("2026-01-01T12:00:00Z");

const sample = (driver, offsetMs, x, y) => ({
  driver_number: driver,
  date: new Date(FROM + offsetMs).toISOString(),
  x,
  y,
});

describe("buildCarTracks", () => {
  it("groups samples per driver, sorted by time relative to the chunk start", () => {
    const cars = buildCarTracks(
      [sample(44, 500, 3, 4), sample(1, 0, 1, 2), sample(44, -200, 5, 6)],
      [
        { driver_number: 1, name_acronym: "VER", team_colour: "3671C6" },
        { driver_number: 44, name_acronym: "HAM", team_colour: null },
      ],
      FROM,
    );

    expect(cars).toEqual([
      {
        driverNumber: 1,
        acronym: "VER",
        teamColour: "#3671C6",
        samples: [[0, 1, 2]],
      },
      {
        driverNumber: 44,
        acronym: "HAM",
        teamColour: "#9CA3AF",
        samples: [
          [-200, 5, 6],
          [500, 3, 4],
        ],
      },
    ]);
  });

  it("drops dropouts and falls back to the driver number", () => {
    const cars = buildCarTracks(
      [sample(7, 0, 0, 0), sample(7, 100, null, 1), sample(7, 200, 8, 9)],
      [],
      FROM,
    );
    expect(cars).toEqual([
      expect.objectContaining({ acronym: "7", samples: [[200, 8, 9]] }),
    ]);
  });
});

describe("getCarPositions", () => {
  beforeEach(() => vi.resetAllMocks());

  it("404s when the session does not exist", async () => {
    getSessions.mockResolvedValue([]);
    await expect(getCarPositions(1, FROM)).rejects.toMatchObject({
      status: 404,
    });
  });

  it("fetches every car for the chunk plus a lead-in", async () => {
    getSessions.mockResolvedValue([
      { session_key: 2, date_end: "2026-01-01T14:00:00Z" },
    ]);
    getDrivers.mockResolvedValue([]);
    getLocation.mockResolvedValue([sample(1, 10, 1, 1)]);

    const { finished, chunk } = await getCarPositions(2, FROM);

    expect(getLocation).toHaveBeenCalledWith({
      sessionKey: 2,
      from: "2026-01-01T11:59:57.000Z",
      to: "2026-01-01T12:01:00.000Z",
    });
    expect(finished).toBe(true);
    expect(chunk.from).toBe("2026-01-01T12:00:00.000Z");
    expect(chunk.to).toBe("2026-01-01T12:01:00.000Z");
    expect(chunk.cars).toHaveLength(1);
  });
});
