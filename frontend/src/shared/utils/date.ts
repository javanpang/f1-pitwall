/**
 * Format a date range from two ISO date strings into a human-readable format. If the start and end dates are in the same month, it will display the day range and month. If they are in different months, it will display the full date range with both months.
 */
export function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const month = (d: Date) =>
    d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });

  if (s.getUTCMonth() === e.getUTCMonth()) {
    return `${s.getUTCDate()}-${e.getUTCDate()} ${month(e)}`;
  }
  return `${s.getUTCDate()} ${month(s)} - ${e.getUTCDate()} ${month(e)}`;
}

/**
 * Format an ISO date string into a human-readable time format in UTC.
 * "14:00 UTC"
 */
export function formatTime(iso: string): string {
  return (
    new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}

/**
 * Format an ISO date string into a human-readable format with the day, month, and time in UTC.
 * "Sun, 14 May · 14:00 UTC"
 */
export function formatWhen(iso: string): string {
  const day = new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `${day} · ${formatTime(iso)}`;
}
