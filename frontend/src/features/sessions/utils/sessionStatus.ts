import type { LapGaps, RaceEvent } from "../types";

export type TrackStatus =
  | "green"
  | "yellow"
  | "sc"
  | "vsc"
  | "red"
  | "chequered";

export function currentLap(lapGaps: LapGaps, atMs: number): number {
  let completed = 0;
  for (const lap of lapGaps.laps) {
    if (Date.parse(lap.at) > atMs) break;
    completed = lap.lap;
  }
  return Math.min(completed + 1, lapGaps.totalLaps);
}

export function trackStatusAt(
  events: RaceEvent[],
  atMs: number,
): TrackStatus | null {
  let status: TrackStatus | null = null;

  for (const event of events) {
    if (Date.parse(event.date) > atMs) break;
    if (status === "chequered") break;

    if (event.kind === "flag") {
      if (event.flag === "GREEN") status = "green";
      else if (event.flag === "RED") status = "red";
      else if (event.flag === "CHEQUERED") status = "chequered";
    } else if (event.kind === "safety-car") {
      const msg = event.message.toUpperCase();
      if (msg.includes("VIRTUAL SAFETY CAR DEPLOYED")) status = "vsc";
      else if (msg.includes("SAFETY CAR DEPLOYED")) status = "sc";
    }
  }

  return status;
}

export const TRACK_STATUS_LABEL: Record<TrackStatus, string> = {
  green: "Green flag",
  yellow: "Yellow flag",
  sc: "Safety car",
  vsc: "Virtual SC",
  red: "Red flag",
  chequered: "Chequered",
};

export const TRACK_STATUS_CLASS: Record<TrackStatus, string> = {
  green: "bg-green-400",
  yellow: "bg-yellow-400",
  sc: "bg-amber-400",
  vsc: "bg-amber-400",
  red: "bg-red-500",
  chequered:
    "bg-[repeating-conic-gradient(#fff_0_25%,#000_0_50%)] bg-size-[6px_6px]",
};
