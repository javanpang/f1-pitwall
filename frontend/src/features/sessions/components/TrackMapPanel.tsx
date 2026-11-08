import { DataPanel } from "../../../shared/components/DataPanel.tsx";
import { TrackMap } from "./TrackMap.tsx";
import { CarMarkers } from "./CarMarkers.tsx";

import { useTrack } from "../hooks/useTrack.ts";

interface TrackMapPanelProps {
  sessionKey: number;
  startMs?: number | null; // Replay start; when set, cars are drawn following playback.
}

export function TrackMapPanel({
  sessionKey,
  startMs = null,
}: TrackMapPanelProps) {
  const state = useTrack(sessionKey);

  return (
    <DataPanel
      label="Track Map"
      state={state}
      className="relative w-full items-center overflow-hidden"
    >
      {(track) => (
        <TrackMap
          points={track.points}
          label={`Track map of ${track.circuitName}`}
        >
          {startMs !== null
            ? ({ size }) => (
                <CarMarkers
                  sessionKey={sessionKey}
                  startMs={startMs}
                  trackSize={size}
                />
              )
            : undefined}
        </TrackMap>
      )}
    </DataPanel>
  );
}
