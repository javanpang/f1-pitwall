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
