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
