import { isAxiosError } from "axios";

/**
 * Use the backend's `{error}` message if available, otherwise use the error's message, otherwise return "Unknown error".
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) return error.response?.data?.error ?? error.message;
  return error instanceof Error ? error.message : "Unknown error";
}
