import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { HttpError } from "./errors/httpError.js";

vi.mock("./services/raceService.js", () => ({
  getRaceWeekend: vi.fn(),
}));

vi.mock("./services/seasonService.js", () => ({
  getSeason: vi.fn(),
}));

import { getRaceWeekend } from "./services/raceService.js";
import { createApp } from "./app.js";
import { getSeason } from "./services/seasonService.js";

const app = createApp({ frontendUrl: "https://pitwall.example.com" });

beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("GET /health", () => {
  it("reports ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/race/weekend", () => {
  it("returns the weekend data from the service", async () => {
    getRaceWeekend.mockResolvedValue({ status: "upcoming" });

    const res = await request(app).get("/api/race/weekend");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "upcoming" });
  });

  it("returns 404 when no meetings exist", async () => {
    getRaceWeekend.mockResolvedValue(null);

    const res = await request(app).get("/api/race/weekend");

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no race weekend found/i);
  });
});

describe("app wiring", () => {
  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/nope");

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("/nope");
  });

  it("only ever advertises the configured frontend origin", async () => {
    const allowed = await request(app)
      .get("/health")
      .set("Origin", "https://pitwall.example.com");
    const other = await request(app)
      .get("/health")
      .set("Origin", "https://bad.example.com");

    expect(allowed.headers["access-control-allow-origin"]).toBe(
      "https://pitwall.example.com",
    );
    expect(other.headers["access-control-allow-origin"]).toBe(
      "https://pitwall.example.com",
    );
    expect(other.headers["access-control-allow-origin"]).not.toBe("*");
  });
});

describe("error handling", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));

  it("returns the status, message and headers of an HttpError", async () => {
    getRaceWeekend.mockRejectedValue(
      new HttpError(503, "Rate limited", { headers: { "Retry-After": "30" } }),
    );

    const res = await request(app).get("/api/race/weekend");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ error: "Rate limited" });
    expect(res.headers["retry-after"]).toBe("30");
  });

  it("hides the message of unexpected errors", async () => {
    getRaceWeekend.mockRejectedValue(
      new Error("secret: db password is hunter2"),
    );

    const res = await request(app).get("/api/race/weekend");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });

  it("does not forward a raw upstream status (regression: 429 leak)", async () => {
    const leaky = Object.assign(
      new Error("Request failed with status code 429"),
      { status: 429 },
    );
    getRaceWeekend.mockRejectedValue(leaky);

    const res = await request(app).get("/api/race/weekend");

    expect(res.status).toBe(500);
  });
});

describe("GET /api/season/:year", () => {
  it("returns the season from the service, passing the year as a number", async () => {
    getSeason.mockResolvedValue([]);

    const res = await request(app).get("/api/seasons/2025");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(getSeason).toHaveBeenCalledWith(2025);
  });

  it.each(["abc", "2022", "1999", "20260", "0x7EA"])(
    "rejects invalid year %s with a 400 and never calls the service",
    async (year) => {
      const res = await request(app).get(`/api/seasons/${year}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/year must be between/i);
      expect(getSeason).not.toHaveBeenCalled();
    },
  );
});
