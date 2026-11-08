import { useMemo } from "react";

import { DataPanel } from "../../../shared/components/DataPanel";
import { RaceFeed } from "./RaceFeed";

import { useRaceFeed } from "../hooks/useRaceFeed";
import { useReplayTimestamp } from "../hooks/useReplay";
import { eventsUpTo } from "../utils/raceFeed";

interface RaceFeedPanelProps {
  sessionKey: number;
  startMs: number;
}

export function RaceFeedPanel({ sessionKey, startMs }: RaceFeedPanelProps) {
  const state = useRaceFeed(sessionKey);
  const at = useReplayTimestamp(startMs);

  const visible = useMemo(
    () => (state.data && at ? eventsUpTo(state.data, Date.parse(at)) : []),
    [state.data, at],
  );

  return (
    <DataPanel
      label="Race feed"
      title="Race Feed"
      state={state}
      className="flex-1"
    >
      {() => (
        <div className="min-h-64 flex-1 overflow-y-auto">
          <RaceFeed events={visible} startMs={startMs} />
        </div>
      )}
    </DataPanel>
  );
}
