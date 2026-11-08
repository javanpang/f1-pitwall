import { memo, useEffect, useMemo, useRef, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus, type LucideIcon } from "lucide-react";

import type { PositionChange, TimingRow } from "../types";
import {
  TIME_STATUS_CLASS,
  TYRE_CONFIG,
  formatInterval,
  formatLapTime,
  formatSector,
  shortTeamName,
} from "../utils/timingFormat";

// ------ Layout ------
const ROW_HEIGHT_PX = 30;
const ROW_LAYOUT =
  "grid grid-cols-[22px_22px_minmax(0,1fr)_66px_58px_40px_20px] " +
  "@[590px]:grid-cols-[22px_22px_minmax(0,1fr)_66px_46px_46px_46px_58px_58px_40px_20px] " +
  "items-center gap-1 px-2";
const WIDE_ONLY = "hidden @[590px]:block";
const MONO_CELL = "font-mono text-xs tabular-nums";

const SECTOR_LABELS = ["S1", "S2", "S3"] as const;

// ------ Empty Value ------
function EmptyValue() {
  return (
    <Minus
      role="img"
      aria-label="No value"
      className="inline-block size-3 align-middle text-faint"
    />
  );
}

// ------ Flash ------
const FLASH_KEYFRAMES: Keyframe[] = [
  { backgroundColor: "rgb(255 255 255 / 0.18)" },
  { backgroundColor: "rgb(255 255 255 / 0)" },
];
const FLASH_OPTIONS: KeyframeAnimationOptions = {
  duration: 900,
  easing: "ease-out",
};

interface FlashProps {
  value: unknown;
  className?: string;
  children: ReactNode;
}

function Flash({ value, className = "", children }: FlashProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (Object.is(prev.current, value)) return;
    prev.current = value;

    const animation = ref.current?.animate(FLASH_KEYFRAMES, FLASH_OPTIONS);
    return () => animation?.cancel();
  }, [value]);

  return (
    <span ref={ref} className={`-mx-0.5 rounded-sm px-0.5 ${className}`}>
      {children}
    </span>
  );
}

// ------ Change Icon ------
interface ChangeIconConfig {
  Icon: LucideIcon;
  label: string;
  className: string;
}

const CHANGE_ICON: Partial<Record<PositionChange, ChangeIconConfig>> = {
  up: { Icon: ArrowUp, label: "Gained position", className: "text-green-400" },
  down: { Icon: ArrowDown, label: "Lost position", className: "text-red-400" },
};
const NO_CHANGE: ChangeIconConfig = {
  Icon: Minus,
  label: "No change",
  className: "text-faint",
};

function ChangeIcon({ change }: { change: PositionChange }) {
  const { Icon, label, className } = CHANGE_ICON[change] ?? NO_CHANGE;
  return (
    <Icon role="img" aria-label={label} className={`size-3 ${className}`} />
  );
}

interface TyreBadgeProps {
  tyre: TimingRow["tyre"];
  size?: number;
}

function TyreBadge({ tyre, size = 16 }: TyreBadgeProps) {
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
      {hasAge && (
        <span className="font-mono text-[10px] tabular-nums text-muted">
          {tyre.ageLaps}
        </span>
      )}
    </span>
  );
}

type TimedValue = TimingRow["lastLap"];

interface TimeCellProps {
  time: TimedValue;
  format: (seconds: TimedValue["seconds"]) => string | null;
  wideOnly?: boolean;
}

function TimeCell({ time, format, wideOnly = false }: TimeCellProps) {
  return (
    <span
      role="cell"
      className={wideOnly ? `${WIDE_ONLY} ${MONO_CELL}` : MONO_CELL}
    >
      <Flash value={time.seconds} className={TIME_STATUS_CLASS[time.status]}>
        {format(time.seconds) ?? <EmptyValue />}
      </Flash>
    </span>
  );
}

// ------ Row ------
interface RowProps {
  row: TimingRow;
  index: number;
}

const Row = memo(function Row({ row, index }: RowProps) {
  return (
    <div
      role="row"
      aria-rowindex={index + 2}
      className={`${ROW_LAYOUT} absolute inset-x-0 top-0 transition-transform duration-500 ease-out hover:bg-carbon-100`}
      style={{
        height: ROW_HEIGHT_PX,
        transform: `translateY(${index * ROW_HEIGHT_PX}px)`,
      }}
    >
      <span role="cell" className="font-mono font-bold tabular-nums text-body">
        {row.position}
      </span>

      <span role="cell" className="flex">
        <ChangeIcon change={row.positionChange} />
      </span>

      <span role="cell" className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className="h-4 w-1 shrink-0 rounded-sm"
          style={{ backgroundColor: row.teamColour }}
        />
        <span className="font-mono font-bold tracking-wide text-body">
          {row.nameAcronym}
        </span>
        <span
          className="hidden truncate whitespace-nowrap text-xs text-muted @[480px]:inline"
          title={row.teamName}
        >
          {shortTeamName(row.teamName)}
        </span>
      </span>

      <span role="cell" className={`${MONO_CELL} text-body`}>
        {formatInterval(row.intervalSeconds, row.position === 1) ?? (
          <EmptyValue />
        )}
      </span>

      {SECTOR_LABELS.map((label, i) => (
        <TimeCell
          key={label}
          time={row.sectors[i]}
          format={formatSector}
          wideOnly
        />
      ))}

      <TimeCell time={row.lastLap} format={formatLapTime} />
      <TimeCell time={row.bestLap} format={formatLapTime} wideOnly />

      <span role="cell" className="flex">
        <TyreBadge tyre={row.tyre} />
      </span>

      <span role="cell" className={`${MONO_CELL} text-right text-muted`}>
        {row.pitStops}
      </span>
    </div>
  );
});

// ----- Header ------
const HEADER_ROW = (
  <div
    role="row"
    aria-rowindex={1}
    className={`${ROW_LAYOUT} border-b border-carbon-300 bg-carbon-100 py-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-muted`}
  >
    <span role="columnheader">Pos</span>
    <span role="columnheader">
      <span className="sr-only">Change</span>
    </span>
    <span role="columnheader">Driver</span>
    <span role="columnheader">Int</span>
    {SECTOR_LABELS.map((label) => (
      <span key={label} role="columnheader" className={WIDE_ONLY}>
        {label}
      </span>
    ))}
    <span role="columnheader">Last</span>
    <span role="columnheader" className={WIDE_ONLY}>
      Best
    </span>
    <span role="columnheader">Tyre</span>
    <span role="columnheader" className="text-right">
      Pit
    </span>
  </div>
);

// ------ Timing Tower ------
interface TimingTowerProps {
  rows: readonly TimingRow[];
}

export function TimingTower({ rows }: TimingTowerProps) {
  const ordered = useMemo(
    () =>
      rows
        .map((row, index) => ({ row, index }))
        .sort((a, b) => a.row.driverNumber - b.row.driverNumber),
    [rows],
  );

  return (
    <div
      role="table"
      aria-label="Timing tower"
      aria-rowcount={rows.length + 1}
      className="@container flex h-full min-h-0 flex-col text-sm"
    >
      <div role="rowgroup" className="shrink-0">
        {HEADER_ROW}
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <div
          role="rowgroup"
          className="relative"
          style={{ height: rows.length * ROW_HEIGHT_PX }}
        >
          {ordered.map(({ row, index }) => (
            <Row key={row.driverNumber} row={row} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
