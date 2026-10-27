import type { KeyboardEvent, PointerEvent } from "react";
import { Pause, Play } from "lucide-react";

import SegmentedControl from "../../../shared/components/SegmentedControl.tsx";

import {
  ratioFromPointer,
  positionFromKey,
  formatElapsed,
  SPEED_OPTIONS,
} from "../utils/replay.ts";
import { useReplayStore } from "../stores/replayStore.ts";
import { useReplayPosition } from "../hooks/useReplay.ts";

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

interface TimelineProps {
  position: number;
  duration: number;
  disabled: boolean;
  onSeek: (position: number) => void;
}

export function Timeline({
  position,
  duration,
  disabled,
  onSeek,
}: TimelineProps) {
  const percent = `${(duration > 0 ? clamp01(position / duration) : 0) * 100}%`;

  const seekFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const ratio = ratioFromPointer(
      e.clientX,
      e.currentTarget.getBoundingClientRect(),
    );
    if (ratio !== null) onSeek(ratio * duration);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromPointer(e);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) seekFromPointer(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const next = positionFromKey(e.key, position, duration, e.shiftKey);
    if (next === null) return;
    e.preventDefault();
    onSeek(next);
  };

  return (
    <div
      role="slider"
      aria-label="Replay position"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={Math.round(position)}
      aria-valuetext={`${formatElapsed(position)} of ${formatElapsed(duration)}`}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      className={`relative flex h-6 min-w-0 flex-1 touch-none items-center select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
      }`}
    >
      {/* Track + fill */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-carbon-300">
        <div className="h-full bg-accent" style={{ width: percent }} />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ left: percent }}
      />
    </div>
  );
}

export default function ReplayControls() {
  const playing = useReplayStore((s) => s.playing);
  const speed = useReplayStore((s) => s.speed);
  const duration = useReplayStore((s) => s.duration);

  const toggle = useReplayStore((s) => s.toggle);
  const setSpeed = useReplayStore((s) => s.setSpeed);
  const seek = useReplayStore((s) => s.seek);

  const position = useReplayPosition();
  const disabled = duration <= 0;

  return (
    <section className="relative flex shrink-0 items-center gap-4 rounded-sm border border-accent/20 bg-carbon-200 px-4 py-3">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={playing ? "Pause replay" : "Play replay"}
        className="flex size-9 cursor-pointer items-center justify-center rounded-sm bg-accent text-carbon-100 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>

      {/* Speed Selector */}
      <SegmentedControl
        label="Replay speed"
        options={[...SPEED_OPTIONS]}
        value={speed}
        onChange={setSpeed}
      />

      {/* Bar */}
      <Timeline
        position={position}
        duration={duration}
        disabled={disabled}
        onSeek={seek}
      />

      {/* Clock */}
      <div className="shrink-0 font-mono text-xs whitespace-nowrap tabular-nums">
        <span className="text-body">{formatElapsed(position)}</span>
        <span className="text-faint"> / {formatElapsed(duration)}</span>
      </div>
    </section>
  );
}
