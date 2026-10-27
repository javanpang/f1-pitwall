import { useTiming } from "../hooks/useTiming";
import { TimingTower } from "./TimingTower";

interface TimingPanelProps {
  sessionKey: number;
  live?: boolean;
  at?: string | null;
}

export function TimingPanel({
  sessionKey,
  live = false,
  at = null,
}: TimingPanelProps) {
  const { data, loading, error } = useTiming(sessionKey, { live, at });

  if (loading && !data) {
    return (
      <div
        role="status"
        aria-label="Loading timing data"
        className="h-96 animate-pulse border border-carbon-300 bg-carbon-200"
      />
    );
  }

  if (error && !data) {
    return (
      <div
        role="alert"
        className="border border-live/40 bg-carbon-200 p-4 font-mono text-sm text-live"
      >
        {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border border-carbon-300 bg-carbon-200 p-4 font-mono text-sm text-muted">
        No timing data is available for this session.
      </div>
    );
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-2 font-mono text-xs text-live uppercase">
          Feed interrupted · showing last known data
        </p>
      )}
      <TimingTower rows={data} />
    </>
  );
}
