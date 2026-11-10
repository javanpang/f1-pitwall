import { DataPanel } from "../../../shared/components/DataPanel.tsx";
import { GapChart } from "./GapChart/GapChart.tsx";

import { useTiming } from "../hooks/useTiming.ts";
import { useLapGaps } from "../hooks/useLapGaps.ts";
import { useReplayTimestamp } from "../hooks/useReplay.ts";

interface GapChartPanelProps {
  sessionKey: number;
  startMs: number; // Replay start; the chart follows playback.
}

export function GapChartPanel({ sessionKey, startMs }: GapChartPanelProps) {
  const at = useReplayTimestamp(startMs);
  const timing = useTiming(sessionKey, { at });
  const lapGaps = useLapGaps(sessionKey);

  const state = {
    data:
      timing.data && lapGaps.data
        ? { rows: timing.data, lapGaps: lapGaps.data }
        : null,
    loading: timing.loading || lapGaps.loading,
    error: timing.error ?? lapGaps.error,
  };

  return (
    <DataPanel
      label="Gap to leader"
      state={state}
      isEmpty={({ lapGaps }) => lapGaps.totalLaps === 0}
      emptyMessage="No lap data is available for this session."
    >
      {({ rows, lapGaps }) => (
        <GapChart rows={rows} lapGaps={lapGaps} at={at} />
      )}
    </DataPanel>
  );
}
