const KEY_STEP_MS = 5_000;
const KEY_STEP_LARGE_MS = 30_000;

export const SPEED_OPTIONS = [
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 4, label: "4x" },
  { value: 8, label: "8x" },
] as const;

export type ReplaySpeed = (typeof SPEED_OPTIONS)[number]["value"];

export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

export function ratioFromPointer(
  clientX: number,
  rect: DOMRect,
): number | null {
  return rect.width === 0
    ? null
    : clamp((clientX - rect.left) / rect.width, 0, 1);
}

export function positionFromKey(
  key: string,
  position: number,
  duration: number,
  large: boolean,
): number | null {
  const step = large ? KEY_STEP_LARGE_MS : KEY_STEP_MS;
  let next: number;
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      next = position + step;
      break;
    case "ArrowLeft":
    case "ArrowDown":
      next = position - step;
      break;
    case "Home":
      return 0;
    case "End":
      return duration;
    default:
      return null;
  }
  return clamp(next, 0, duration);
}
