import type { RaceEvent } from "../types";

/** Events that have happened by `atMs`, newest first. Expects `events` sorted oldest first. */
export function eventsUpTo(events: RaceEvent[], atMs: number): RaceEvent[] {
  let lo = 0;
  let hi = events.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (Date.parse(events[mid].date) <= atMs) lo = mid + 1;
    else hi = mid;
  }
  return events.slice(0, lo).reverse();
}

const FLAG_CLASS: Record<string, string> = {
  GREEN: "bg-green-400",
  CLEAR: "bg-green-400",
  YELLOW: "bg-yellow-400",
  "DOUBLE YELLOW": "bg-yellow-400",
  RED: "bg-red-500",
  BLUE: "bg-blue-400",
  CHEQUERED:
    "bg-[repeating-conic-gradient(#fff_0_25%,#000_0_50%)] bg-size-[6px_6px]",
  "BLACK AND WHITE": "bg-[linear-gradient(135deg,#fff_50%,#000_50%)]",
};

/** Tailwind classes for the marker beside each event. */
export function eventMarkerClass(event: RaceEvent): string {
  switch (event.kind) {
    case "flag":
      return FLAG_CLASS[event.flag ?? ""] ?? "bg-muted";
    case "safety-car":
      return "bg-amber-400";
    case "steward":
      return "bg-live";
    case "pit":
      return "bg-accent";
    default:
      return "bg-faint";
  }
}

export const EVENT_KIND_LABEL: Record<RaceEvent["kind"], string> = {
  flag: "Flag",
  "safety-car": "Safety car",
  steward: "Stewards",
  pit: "Pit",
  drs: "DRS",
  session: "Session",
  other: "Race control",
};
