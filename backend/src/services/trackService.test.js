import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../clients/openf1Client.js", () => ({
  getSessions: vi.fn(),
  getLaps: vi.fn(),
  getLocation: vi.fn(),
}));

import { getLaps, getLocation, getSessions } from "../clients/openf1Client.js";
import {
  getTrack,
  lapWindow,
  pickReferenceLap,
  toTrackPoints,
} from "./trackService.js";

// Use fresh circuit key to avoid cache collisions between tests
let nextCircuit = 1000;
const newCircuit = () => nextCircuit++;

const session = (key, circuit, year = 2026) => ({
  session_key: key,
  circuit_key: circuit,
  circuit_short_name: "Test Circuit",
  year,
});

const lap = (driver, duration, extra = {}) => ({
  driver_number: driver,
  lap_duration: duration,
  date_start: "2026-01-01T12:00:00Z",
  is_pit_out_lap: false,
  ...extra,
});

const samples = (n) =>
  Array.from({ length: n }, (_, i) => ({
    date: new Date(Date.UTC(2026, 0, 1, 12, 0, i)).toISOString(),
    x: i + 1,
    y: (i + 1) * 2,
  }));

describe("pickReferenceLap", () => {
  it("picks the fastest lap", () => {
    // Driver 1: 95s, Driver 44: 90s
    expect(pickReferenceLap([lap(1, 95), lap(44, 90)]).driver_number).toBe(44);
  });

  it("ignores pit-out laps, unfinished laps and laps with no start time", () => {
    const result = pickReferenceLap([
      lap(1, 80, { is_pit_out_lap: true }),
      lap(2, null),
      lap(3, 85, { date_start: null }),
      lap(4, 92),
    ]);
    expect(result.driver_number).toBe(4);
  });

  it("returns null when no lap is usable", () => {
    expect(pickReferenceLap([])).toBeNull();
    expect(pickReferenceLap([lap(1, null)])).toBeNull();
  });
});

describe("lapWindow", () => {
  it("spans from the lap start to start + duration", () => {
    expect(lapWindow(lap(1, 90.5))).toEqual({
      from: "2026-01-01T12:00:00.000Z",
      to: "2026-01-01T12:01:30.500Z",
    });
  });
});

describe("toTrackPoints", () => {
  it("sorts by time, strips extra fields, and drops dropouts and bad rows", () => {
    const result = toTrackPoints([
      { date: "2026-01-01T00:00:02Z", x: 3, y: 3, z: 9 },
      { date: "2026-01-01T00:00:00Z", x: 1, y: 1, z: 9 },
      { date: "2026-01-01T00:00:01Z", x: 0, y: 0, z: 9 },
      { date: "2026-01-01T00:00:03Z", x: null, y: 5 },
    ]);
    expect(result).toEqual([
      { x: 1, y: 1 },
      { x: 3, y: 3 },
    ]);
  });
});

describe("getTrack", () => {
  beforeEach(() => vi.resetAllMocks());

  it("404s when the session does not exist", async () => {
    getSessions.mockResolvedValue([]);

    await expect(getTrack(1)).rejects.toMatchObject({ status: 404 });
  });

  it("traces the fastest lap's window for that lap's driver", async () => {
    getSessions.mockResolvedValue([session(7, newCircuit())]);
    getLaps.mockResolvedValue([
      lap(1, 95),
      lap(44, 90),
      lap(16, 80, { is_pit_out_lap: true }),
    ]);
    getLocation.mockResolvedValue(samples(60));

    const track = await getTrack(7);

    expect(getLocation).toHaveBeenCalledWith({
      sessionKey: 7,
      driverNumber: 44,
      from: "2026-01-01T12:00:00.000Z",
      to: "2026-01-01T12:01:30.000Z",
    });
    expect(track.circuitName).toBe("Test Circuit");
    expect(track.points).toHaveLength(60);
    expect(track.points[0]).toEqual({ x: 1, y: 2 });
  });

  it("404s when there are too few location samples", async () => {
    getSessions.mockResolvedValue([session(8, newCircuit())]);
    getLaps.mockResolvedValue([lap(1, 90)]);
    getLocation.mockResolvedValue(samples(10));

    await expect(getTrack(8)).rejects.toMatchObject({ status: 404 });
  });

  it("does not cache a failure", async () => {
    getSessions.mockResolvedValue([session(9, newCircuit())]);
    getLaps.mockResolvedValue([lap(1, 90)]);
    getLocation.mockResolvedValueOnce([]).mockResolvedValueOnce(samples(60));

    await expect(getTrack(9)).rejects.toMatchObject({ status: 404 });
    await expect(getTrack(9)).resolves.toMatchObject({
      points: expect.any(Array),
    });
  });

  it("shares one fetch between sessions of the same circuit and year", async () => {
    const circuit = newCircuit();
    getSessions
      .mockResolvedValueOnce([session(10, circuit)])
      .mockResolvedValueOnce([session(11, circuit)]);
    getLaps.mockResolvedValue([lap(1, 90)]);
    getLocation.mockResolvedValue(samples(60));

    await getTrack(10);
    await getTrack(11);

    expect(getLaps).toHaveBeenCalledTimes(1);
  });

  it("keeps separate entries for different years at the same circuit", async () => {
    const circuit = newCircuit();
    getSessions
      .mockResolvedValueOnce([session(12, circuit, 2025)])
      .mockResolvedValueOnce([session(13, circuit, 2026)]);
    getLaps.mockResolvedValue([lap(1, 90)]);
    getLocation.mockResolvedValue(samples(60));

    await getTrack(12);
    await getTrack(13);

    expect(getLaps).toHaveBeenCalledTimes(2);
  });
});
