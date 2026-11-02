import { useCarPositions } from "../hooks/useCarPositions.ts";
import { useReplayPosition } from "../hooks/useReplay.ts";
import { interpolatePosition } from "../utils/carPositions.ts";

interface CarMarkersProps {
  sessionKey: number;
  startMs: number;
  trackSize: number; // the size of the track in SVG units, used to scale markers to the circuit
}

/**
 * Draws each car on the track map at its interpolated position for the current replay time.
 */
export default function CarMarkers({
  sessionKey,
  startMs,
  trackSize,
}: CarMarkersProps) {
  const { data } = useCarPositions(sessionKey, startMs);
  const position = useReplayPosition();

  if (!data) return null;

  const t = startMs + position - Date.parse(data.from);
  const radius = trackSize * 0.012;
  const fontSize = trackSize * 0.022;

  return (
    <g aria-hidden="true">
      {data.cars.map((car) => {
        const p = interpolatePosition(car.samples, t);
        if (!p) return null;
        return (
          <g key={car.driverNumber} transform={`translate(${p.x} ${-p.y})`}>
            <title>{car.acronym}</title>
            <circle
              r={radius}
              fill={car.teamColour}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              className="stroke-carbon-100"
            />
            <text
              x={radius * 1.4}
              y={-radius * 1.4}
              fontSize={fontSize}
              className="fill-body font-mono"
            >
              {car.acronym}
            </text>
          </g>
        );
      })}
    </g>
  );
}
