import { isAxiosError } from "axios";
import { HttpError } from "../errors/httpError.js";

const TIMEOUT_CODES = ["ECONNABORTED", "ETIMEDOUT"];

export function toUpstreamError(error) {
  if (!isAxiosError(error)) return error;

  if (error.response?.status === 429) {
    const retryAfter = error.response.headers["retry-after"];
    return new HttpError(
      503,
      "Race data provider is rate limiting requests. Please try again later.",
      {
        cause: error,
        headers: retryAfter ? { "Retry-After": retryAfter } : undefined,
      },
    );
  }

  if (TIMEOUT_CODES.includes(error.code)) {
    return new HttpError(504, "Race data provider timed out.", {
      cause: error,
    });
  }

  return new HttpError(502, "Race data provider is unavailable.", {
    cause: error,
  });
}
