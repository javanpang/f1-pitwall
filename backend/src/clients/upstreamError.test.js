import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import { toUpstreamError } from "./upstreamError.js";
import { HttpError } from "../errors/httpError.js";

const axiosError = ({ status, code, headers = {} } = {}) =>
  new AxiosError(
    "boom",
    code,
    undefined,
    undefined,
    status ? { status, headers } : undefined,
  );

describe("toUpstreamError", () => {
  it("maps upstream 429 to 503 and forwards Retry-After", () => {
    const result = toUpstreamError(
      axiosError({ status: 429, headers: { "retry-after": "30" } }),
    );

    expect(result).toBeInstanceOf(HttpError);
    expect(result.status).toBe(503);
    expect(result.headers).toEqual({ "Retry-After": "30" });
  });

  it("maps upstream 429 without Retry-After to 503 with no headers", () => {
    const result = toUpstreamError(axiosError({ status: 429 }));

    expect(result.status).toBe(503);
    expect(result.headers).toBeUndefined();
  });

  it("maps timeouts to 504", () => {
    expect(toUpstreamError(axiosError({ code: "ECONNABORTED" })).status).toBe(
      504,
    );
  });

  it("maps upstream 5xx to 502", () => {
    expect(toUpstreamError(axiosError({ status: 500 })).status).toBe(502);
  });

  it("maps network failures (no response) to 502", () => {
    expect(toUpstreamError(axiosError({ code: "ECONNREFUSED" })).status).toBe(
      502,
    );
  });

  it("keeps the original error as `cause` for logging", () => {
    const original = axiosError({ status: 429 });

    expect(toUpstreamError(original).cause).toBe(original);
  });

  it("passes non-Axios errors through unchanged", () => {
    const bug = new TypeError("not an http problem");

    expect(toUpstreamError(bug)).toBe(bug);
  });
});
