import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { PositionChange, TimingRow } from "../types";
import {
  TIME_STATUS_CLASS,
  TYRE_CONFIG,
  formatInterval,
  formatLapTime,
  formatSector,
} from "../utils/timingFormat";

interface TimingTowerProps {
  rows: TimingRow[];
}

const HEADERS = [
  "Pos",
  "",
  "Driver",
  "Interval",
  "S1",
  "S2",
  "S3",
  "Last",
  "Best",
  "Tyre",
  "Pit",
];

function ChangeIcon({ change }: { change: PositionChange }) {
  if (change === "up")
    return (
      <ArrowUp
        aria-label="Gained position"
        className="size-3.5 text-green-400"
      />
    );
  if (change === "down")
    return (
      <ArrowDown aria-label="Lost position" className="size-3.5 text-red-400" />
    );
  return <Minus aria-label="No change" className="size-3.5 text-faint" />;
}

function TyreBadge({
  tyre,
  size = 18,
}: {
  tyre: TimingRow["tyre"];
  size?: number;
}) {
  const c = TYRE_CONFIG[tyre.compound] ?? TYRE_CONFIG.UNKNOWN;

  return (
    <span
      className="inline-flex items-center gap-1"
      title={`${tyre.compound.toLowerCase()}${
        tyre.ageLaps != null ? `, ${tyre.ageLaps} laps old` : ""
      }`}
    >
      <span
        className="inline-flex items-center justify-center rounded-full border-2 bg-zinc-950 font-bold leading-none"
        style={{
          borderColor: c.colour,
          color: c.colour,
          width: size,
          height: size,
          fontSize: size * 0.5,
        }}
      >
        {c.letter}
      </span>

      {tyre.ageLaps != null && (
        <span className="w-4 text-right text-xs tabular-nums text-muted">
          {tyre.ageLaps}
        </span>
      )}
    </span>
  );
}

export function TimingTower({ rows }: TimingTowerProps) {
  return (
    <section className="relative border border-carbon-300 bg-carbon-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-215 border-collapse text-left text-xs tabular-nums">
          <thead>
            <tr className="border-b border-carbon-300 bg-carbon-100">
              {HEADERS.map((header, i) => (
                <th
                  key={i}
                  scope="col"
                  className="whitespace-nowrap px-1 py-1 font-mono text-[10px] font-medium tracking-widest text-muted uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.driverNumber}
                className="transition-colors hover:bg-accent/5"
              >
                <td className="w-7 px-0.5 font-mono text-body">
                  {row.position}
                </td>
                <td>
                  <ChangeIcon change={row.positionChange} />
                </td>
                <td className="px-1 py-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-4 w-1 shrink-0 rounded-sm"
                      style={{ backgroundColor: row.teamColour }}
                      aria-hidden="true"
                    />
                    <div className="flex min-w-0 items-center gap-2 leading-tight">
                      <div className="font-mono text-sm font-bold tracking-wider text-body">
                        {row.nameAcronym}
                      </div>
                      <div className="truncate text-[11px] text-muted">
                        {row.teamName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-1 py-1 font-mono text-body">
                  {formatInterval(row.intervalSeconds, row.position === 1)}
                </td>
                {row.sectors.map((s, i) => (
                  <td
                    key={i}
                    className={`px-1 py-1 font-mono ${TIME_STATUS_CLASS[s.status]}`}
                  >
                    {formatSector(s.seconds)}
                  </td>
                ))}
                <td
                  className={`px-1 py-1 font-mono ${TIME_STATUS_CLASS[row.lastLap.status]}`}
                >
                  {formatLapTime(row.lastLap.seconds)}
                </td>
                <td
                  className={`px-1 py-1 font-mono ${TIME_STATUS_CLASS[row.bestLap.status]}`}
                >
                  {formatLapTime(row.bestLap.seconds)}
                </td>
                <td className="px-1 py-1">
                  <TyreBadge tyre={row.tyre} />
                </td>
                <td className="px-1 py-1 font-mono text-muted">
                  {row.pitStops}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
