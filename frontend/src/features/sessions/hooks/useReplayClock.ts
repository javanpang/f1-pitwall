import { useCallback, useEffect, useRef, useState } from "react";
import type { ReplaySpeed } from "../utils/replay";

export function useReplayClock(durationMs: number) {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<ReplaySpeed>(1);

  const positionRef = useRef(0);

  useEffect(() => {
    if (!playing) return;

    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const next = Math.min(
        positionRef.current + (now - last) * speed,
        durationMs,
      );
      last = now;
      positionRef.current = next;
      setPosition(next);

      if (next >= durationMs) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [playing, speed, durationMs]);

  const seek = useCallback(
    (ms: number) => {
      const clamped = Math.min(Math.max(ms, 0), durationMs);
      positionRef.current = clamped;
      setPosition(clamped);
    },
    [durationMs],
  );

  const togglePlay = useCallback(() => {
    if (!playing && positionRef.current >= durationMs) seek(0);
    setPlaying((p) => !p);
  }, [playing, durationMs, seek]);

  return { position, playing, speed, setSpeed, seek, togglePlay };
}
