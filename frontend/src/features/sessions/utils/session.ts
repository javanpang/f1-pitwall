import type { SessionDetails } from "../api/sessions";

export function parseSessionKey(raw: string | undefined): number | null {
  return raw !== undefined && /^[1-9]\d{0,8}$/.test(raw) ? Number(raw) : null;
}

export function sessionWindow(
  session: Pick<SessionDetails, "dateStart" | "dateEnd"> | null,
): { startMs: number; durationMs: number } | null {
  if (!session) return null;
  const startMs = Date.parse(session.dateStart);
  const endMs = Date.parse(session.dateEnd);
  if (
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs) ||
    endMs <= startMs
  ) {
    return null;
  }
  return { startMs, durationMs: endMs - startMs };
}
