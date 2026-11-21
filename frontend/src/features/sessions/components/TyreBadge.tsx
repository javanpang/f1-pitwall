import type { TyreSet } from "../types";
import { TYRE_CONFIG } from "../utils/timingFormat";

interface TyreBadgeProps {
  tyre: TyreSet;
  size?: number;
  showAge?: boolean;
}

export function TyreBadge({ tyre, size = 16, showAge = true }: TyreBadgeProps) {
  const { colour, letter } = TYRE_CONFIG[tyre.compound] ?? TYRE_CONFIG.UNKNOWN;
  const hasAge = tyre.ageLaps != null;
  const title = `${tyre.compound.toLowerCase()}${hasAge ? `, ${tyre.ageLaps} laps old` : ""}`;

  return (
    <span className="inline-flex items-center gap-1" title={title}>
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-full border-2 bg-zinc-950 font-bold leading-none"
        style={{
          borderColor: colour,
          color: colour,
          width: size,
          height: size,
          fontSize: size * 0.5,
        }}
      >
        {letter}
      </span>
      {showAge && hasAge && (
        <span className="font-mono text-[10px] tabular-nums text-muted">
          {tyre.ageLaps}
        </span>
      )}
    </span>
  );
}
