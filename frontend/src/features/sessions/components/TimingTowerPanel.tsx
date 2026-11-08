import { DataPanel } from "../../../shared/components/DataPanel";
import { TimingTower } from "./TimingTower";

import { useReplayTimestamp } from "../hooks/useReplay";
import { useTiming } from "../hooks/useTiming";

interface TimingTowerPanelProps {
  sessionKey: number;
  startMs: number;
}

export function TimingTowerPanel({
  sessionKey,
  startMs,
}: TimingTowerPanelProps) {
  const at = useReplayTimestamp(startMs);
  const state = useTiming(sessionKey, { at });

  return (
    <DataPanel
      label="Timing tower"
      state={state}
      isEmpty={(rows) => rows.length === 0}
      emptyMessage="No timing data is available for this session."
      className="h-full"
    >
      {(rows) => <TimingTower rows={rows} />}
    </DataPanel>
  );
}
