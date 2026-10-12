import { describe, expect, it } from "vitest";
import { AxiosError, type AxiosResponse } from "axios";
import { getErrorMessage } from "./getErrorMessage.ts";

describe("getErrorMessage", () => {
  it("prefers the backend's error message", () => {
    const response = {
      status: 404,
      data: { error: "Not here" },
    } as AxiosResponse;
    const error = new AxiosError(
      "Request failed",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      response,
    );

    expect(getErrorMessage(error)).toBe("Not here");
  });

  it("falls back to the Axios message when there is no response body", () => {
    expect(getErrorMessage(new AxiosError("Network Error"))).toBe(
      "Network Error",
    );
  });

  it("handles plain errors and unknown values", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
    expect(getErrorMessage("???")).toBe("Unknown error");
  });
});
