import { useEffect, useState } from "react";
import { useReplayStore, type ReplayStore } from "../stores/replayStore.ts";

const quantize = (ms: number, stepMs: number) =>
  Math.floor(ms / stepMs) * stepMs;

export function useReplayPosition(stepMs = 0): number {
  return useReplayStore((s) =>
    stepMs > 0 ? quantize(s.position, stepMs) : s.position,
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
  const [position, setPosition] = useState(() =>
    quantize(useReplayStore.getState().position, realStepMs),
  );

  useEffect(() => {
    const sync = ({ position: raw, playing, speed }: ReplayStore) => {
      const next = quantize(raw, realStepMs);
      setPosition((prev) =>
        !playing || next < prev || next - prev >= realStepMs * speed
          ? next
          : prev,
      );
    };
    sync(useReplayStore.getState());
    return useReplayStore.subscribe(sync);
  }, [realStepMs]);

  return startMs === null ? null : new Date(startMs + position).toISOString();
}
