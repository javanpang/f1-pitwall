const KEY_STEP_MS = 5_000;
const KEY_STEP_LARGE_MS = 30_000;

export const SPEED_OPTIONS = [
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 4, label: "4x" },
  { value: 8, label: "8x" },
] as const;

export type ReplaySpeed = (typeof SPEED_OPTIONS)[number]["value"];

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

export const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

export function ratioFromPointer(
  clientX: number,
  rect: DOMRect,
): number | null {
  return rect.width === 0 ? null : clamp01((clientX - rect.left) / rect.width);
}

export function positionFromKey(
  key: string,
  position: number,
  duration: number,
  large: boolean,
): number | null {
  const step = large ? KEY_STEP_LARGE_MS : KEY_STEP_MS;
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return position + step;
    case "ArrowLeft":
    case "ArrowDown":
      return position - step;
    case "Home":
      return 0;
    case "End":
      return duration;
    default:
      return null;
  }
}
