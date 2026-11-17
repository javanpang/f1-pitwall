import { useMemo } from "react";

import { DataPanel } from "../../../shared/components/DataPanel";
import { PitStop } from "./PitStop";

import { usePitStops } from "../hooks/usePitStops";
import { useReplayTimestamp } from "../hooks/useReplay";
import { pitStopsUpTo } from "../utils/pitStops";

interface PitStopPanelProps {
  sessionKey: number;
  startMs: number;
}

export function PitStopPanel({ sessionKey, startMs }: PitStopPanelProps) {
  const state = usePitStops(sessionKey);
  const at = useReplayTimestamp(startMs);
  const atMs = at ? Date.parse(at) : startMs;

  const visible = useMemo(
    () => (state.data ? pitStopsUpTo(state.data, atMs) : []),
    [state.data, atMs],
  );

  return (
    <DataPanel
      label="Pit stops"
      title="Pit Stops"
      state={state}
      className="flex-1"
    >
      {() => (
        <div className="min-h-48 flex-1 overflow-y-auto">
          <PitStop stops={visible} atMs={atMs} />
        </div>
      )}
    </DataPanel>
  );
}
