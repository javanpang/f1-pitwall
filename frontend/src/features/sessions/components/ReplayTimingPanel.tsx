import { useReplayTimestamp } from "../hooks/useReplay";
import { TimingPanel } from "./TimingPanel";

interface ReplayTimingPanelProps {
  sessionKey: number;
  startMs: number;
}

export function ReplayTimingPanel({
  sessionKey,
  startMs,
}: ReplayTimingPanelProps) {
  const at = useReplayTimestamp(startMs);
  return <TimingPanel sessionKey={sessionKey} at={at} />;
}
