import { useEffect } from "react";
import { useReplayStore } from "../stores/replayStore.ts";

export function useReplayPosition(stepMs = 0): number {
  return useReplayStore((s) =>
    stepMs > 0 ? Math.floor(s.position / stepMs) * stepMs : s.position,
  );
}

export function useReplaySession(
  sessionKey: number | null,
  durationMs: number,
) {
  useEffect(() => {
    useReplayStore.getState().reset();
    return () => useReplayStore.getState().reset();
  }, [sessionKey]);

  useEffect(() => {
    useReplayStore.getState().setDuration(durationMs);
  }, [sessionKey, durationMs]);
}

export function useReplayTimestamp(
  startMs: number | null,
  realStepMs = 1_000,
): string | null {
  const speed = useReplayStore((s) => s.speed);
  const position = useReplayPosition(realStepMs * speed);

  return startMs === null ? null : new Date(startMs + position).toISOString();
}
