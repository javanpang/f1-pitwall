import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Minus,
  MoveRight,
} from "lucide-react";

import type { PitStop, PitStopTyre } from "../types";
import { formatPitDuration, positionDelta } from "../utils/pitStops";
import { TyreBadge } from "./TyreBadge";

const ROW =
  "grid grid-cols-[32px_48px_48px_minmax(0,1fr)_40px] items-center gap-2 px-1.5 py-1.5 font-mono text-xs tabular-nums";

function Faint() {
  return (
    <Minus
      role="img"
      aria-label="Unknown"
      className="inline-block size-3 align-middle text-faint"
    />
  );
}

function Tyre({ tyre }: { tyre: PitStopTyre | null }) {
  if (!tyre) return <Faint />;
  const used = tyre.ageLaps !== null && tyre.ageLaps > 0;
  return (
    <span className="relative inline-flex">
      <TyreBadge tyre={tyre} size={14} showAge={false} />
      {used && (
        <span
          title={`Used set, ${tyre.ageLaps} laps old`}
          className="absolute -right-0.5 -bottom-0.5 size-1.5 rounded-full bg-muted ring-1 ring-carbon-200"
        />
      )}
    </span>
  );
}

function PositionChange({ stop, atMs }: { stop: PitStop; atMs: number }) {
  const delta = positionDelta(stop, atMs);
  const before = stop.positionBefore;

  let deltaNode;
  if (delta === null) {
    deltaNode = (
      <span className="text-faint" title="Out-lap in progress">
        <Minus role="img" className="size-3 text-faint" />
      </span>
    );
  } else if (delta > 0) {
    deltaNode = (
      <span className="inline-flex items-center text-green-400">
        <ArrowUp role="img" aria-label="Gained" className="size-3" />
        {delta}
      </span>
    );
  } else if (delta < 0) {
    deltaNode = (
      <span className="inline-flex items-center text-red-400">
        <ArrowDown role="img" aria-label="Lost" className="size-3" />
        {-delta}
      </span>
    );
  } else {
    deltaNode = (
      <Minus role="img" aria-label="No change" className="size-3 text-faint" />
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-body">
        {before === null ? <Faint /> : `P${before}`}
        {delta !== null && stop.positionAfter !== null && (
          <span className="inline-flex items-center gap-1">
            <MoveRight className="size-3" /> P{stop.positionAfter}
          </span>
        )}
      </span>
      {deltaNode}
    </span>
  );
}

interface PitStopProps {
  stops: PitStop[];
  atMs: number;
}

export function PitStop({ stops, atMs }: PitStopProps) {
  if (stops.length === 0) {
    return (
      <p className="p-4 font-mono text-xs tracking-widest text-muted uppercase">
        No pit stops yet
      </p>
    );
  }

  return (
    <ol aria-label="Pit stops" className="divide-y divide-carbon-300">
      {stops.map((stop) => (
        <li key={stop.id} className={`${ROW} hover:bg-carbon-100`}>
          <span className="text-muted">
            {stop.lapNumber === null ? <Faint /> : `L${stop.lapNumber}`}
          </span>

          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-3.5 w-1 shrink-0 rounded-sm"
              style={{ backgroundColor: stop.driver.teamColour }}
            />
            <span className="font-bold tracking-wide text-body">
              {stop.driver.acronym}
            </span>
          </span>

          <span className="flex items-center gap-0.5">
            <Tyre tyre={stop.tyreFrom} />
            <ChevronRight aria-hidden="true" className="size-3 text-faint" />
            <Tyre tyre={stop.tyreTo} />
          </span>

          <PositionChange stop={stop} atMs={atMs} />

          <span className="text-right text-muted">
            {formatPitDuration(stop) ?? <Faint />}
          </span>
        </li>
      ))}
    </ol>
  );
}
