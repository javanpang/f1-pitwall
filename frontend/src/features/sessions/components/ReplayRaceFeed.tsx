import type { ReactNode } from "react";
import { useMemo } from "react";
import { useRaceFeed } from "../hooks/useRaceFeed";
import { useReplayTimestamp } from "../hooks/useReplay";
import { eventsUpTo } from "../utils/raceFeed";
import { RaceFeed } from "./RaceFeed";

interface ReplayRaceFeedProps {
  sessionKey: number;
  startMs: number;
}

export function ReplayRaceFeed({ sessionKey, startMs }: ReplayRaceFeedProps) {
  const { data, loading, error } = useRaceFeed(sessionKey);
  const at = useReplayTimestamp(startMs);

  const visible = useMemo(
    () => (data && at ? eventsUpTo(data, Date.parse(at)) : []),
    [data, at],
  );

  let content: ReactNode;
  if (loading) {
    content = (
      <div
        role="status"
        aria-label="Loading race feed"
        className="h-full animate-pulse bg-carbon-300/40"
      />
    );
  } else if (error) {
    content = (
      <p
        role="alert"
        className="p-4 font-mono text-xs tracking-widest text-live uppercase"
      >
        Feed error: {error}
      </p>
    );
  } else {
    content = <RaceFeed events={visible} startMs={startMs} />;
  }

  return (
    <section
      aria-label="Race feed"
      className="flex min-h-0 flex-1 flex-col rounded-sm border border-accent/20 bg-carbon-200"
    >
      <h2 className="shrink-0 border-b border-carbon-300 px-1 py-1 font-mono text-[10px] font-medium tracking-widest text-muted uppercase">
        Race feed
      </h2>
      <div className="min-h-64 flex-1 overflow-y-auto">{content}</div>
    </section>
  );
}
