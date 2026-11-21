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

/** A tyre set: compound plus age in laps (null when unknown). */
export interface TyreSet {
  compound: TyreCompound;
  ageLaps: number | null; // the age when fitted. 0 means a new set.
}

/** Driver details attached to race events and pit stops. */
export interface DriverRef {
  number: number;
  acronym: string;
  teamColour: string;
}

/** A lap or sector time with its colour-coded status. */
export interface TimedValue {
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
  sectors: [TimedValue, TimedValue, TimedValue];
  lastLap: TimedValue;
  bestLap: TimedValue;
  tyre: TyreSet;
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
  driver: DriverRef | null;
}

/** `[msSinceChunkStart, x, y]` - may be negative for the lead-in before the chunk. */
export type CarSample = [number, number, number];

export interface CarTrack {
  driverNumber: number;
  acronym: string;
  teamColour: string;
  samples: CarSample[];
}

export interface CarPositionsChunk {
  from: string;
  to: string;
  cars: CarTrack[];
}

/** Gap to leader at the end of one lap. */
export interface LapGap {
  lap: number;
  at: string; // time leader crossed the line.
  leader: number;
  gaps: Record<string, number>;
}

export interface LapGaps {
  totalLaps: number;
  laps: LapGap[];
}

export interface PitStop {
  id: string;
  date: string;
  lapNumber: number | null;
  driver: DriverRef;
  tyreFrom: TyreSet | null;
  tyreTo: TyreSet | null;
  stopSeconds: number | null; // Stationary time.
  laneSeconds: number | null; // Pit lane time.
  positionBefore: number | null;
  positionAfter: number | null; // Position at the end of the out-lap.
  settledAt: string | null; // When `positionAfter` is known.
}
