export interface TrackPoint {
  x: number;
  y: number;
}

export interface Track {
  circuitKey: number;
  circuitName: string;
  year: number;
  points: TrackPoint[];
}

export type TyreCompound =
  | "SOFT"
  | "MEDIUM"
  | "HARD"
  | "INTERMEDIATE"
  | "WET"
  | "UNKNOWN";

export type TimeStatus = "overall-best" | "personal-best" | "default";

export type PositionChange = "up" | "down" | "none";

export interface SectorTime {
  seconds: number | null;
  status: TimeStatus;
}

export interface TimingRow {
  position: number;
  driverNumber: number;
  nameAcronym: string;
  teamName: string;
  teamColour: string;
  positionChange: PositionChange;
  intervalSeconds: number | null;
  sectors: [SectorTime, SectorTime, SectorTime];
  lastLap: { seconds: number | null; status: TimeStatus };
  bestLap: { seconds: number | null; status: TimeStatus };
  tyre: { compound: TyreCompound; ageLaps: number | null };
  pitStops: number;
}

export type RaceEventKind =
  | "flag"
  | "safety-car"
  | "steward"
  | "pit"
  | "drs"
  | "session"
  | "other";

export interface RaceEvent {
  id: string;
  date: string;
  kind: RaceEventKind;
  flag: string | null;
  lapNumber: number | null;
  message: string;
  driver: { number: number; acronym: string; teamColour: string } | null;
}
