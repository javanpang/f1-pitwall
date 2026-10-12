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
