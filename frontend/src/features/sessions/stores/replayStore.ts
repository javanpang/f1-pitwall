import { create } from "zustand";
import type { ReplaySpeed } from "../utils/replay";

const MAX_FRAME_MS = 250;

interface ReplayState {
  position: number;
  duration: number;
  playing: boolean;
  speed: ReplaySpeed;
}

interface ReplayActions {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (ms: number) => void;
  setSpeed: (speed: ReplaySpeed) => void;
  setDuration: (ms: number) => void;
  reset: () => void;
}

export type ReplayStore = ReplayState & ReplayActions;

const initialState: ReplayState = {
  position: 0,
  duration: 0,
  playing: false,
  speed: 1,
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

export const useReplayStore = create<ReplayStore>()((set, get) => {
  let frame = 0;
  let last = 0;

  const stopLoop = () => cancelAnimationFrame(frame);

  const tick = (now: number) => {
    const { position, speed, duration } = get();

    const elapsed = clamp(now - last, 0, MAX_FRAME_MS);
    const next = Math.min(position + elapsed * speed, duration);
    last = now;

    if (next >= duration) {
      set({ position: next, playing: false });
      return;
    }
    set({ position: next });
    frame = requestAnimationFrame(tick);
  };

  const pause = () => {
    if (!get().playing) return;
    stopLoop();
    set({ playing: false });
  };

  const play = () => {
    const { playing, duration, position } = get();
    if (playing || duration <= 0) return;
    last = performance.now();
    set({ playing: true, position: position >= duration ? 0 : position });
    frame = requestAnimationFrame(tick);
  };

  return {
    ...initialState,
    play,
    pause,
    toggle: () => (get().playing ? pause() : play()),
    seek: (ms) => set({ position: clamp(ms, 0, get().duration) }),
    setSpeed: (speed) => set({ speed }),
    setDuration: (ms) => {
      const duration = Math.max(0, ms);
      if (duration === get().duration) return;
      if (duration === 0) pause();
      set({ duration, position: Math.min(get().position, duration) });
    },
    reset: () => {
      stopLoop();
      set(initialState);
    },
  };
});
