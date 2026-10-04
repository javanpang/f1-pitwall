import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("./services/raceService.js", () => ({
  getRaceWeekend: vi.fn(),
}));

import { getRaceWeekend } from "./services/raceService.js";
import { createApp } from "./app.js";

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
