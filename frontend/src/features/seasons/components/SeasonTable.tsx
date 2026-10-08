import { Link } from "react-router-dom";
import type { Session, SessionStatus } from "../../../shared/types/f1.ts";
import {
  formatDateRange,
  formatWhen,
  getSessionStatus,
  type FeaturedRound,
  type Round,
  type SessionColumn,
} from "../utils/season.ts";

interface SessionCellProps {
  session: Session | undefined;
  status: SessionStatus | null;
  label: string;
}

interface RoundRowProps {
  round: Round;
  columns: readonly SessionColumn[];
  now: number;
  featured: FeaturedRound | null;
}

interface SeasonTableProps {
  year: number;
  rounds: Round[];
  columns: readonly SessionColumn[];
  now: number;
  featured: FeaturedRound | null;
}

/**
 * SessionCell component that displays a session's status and provides a link to the session details.
 */
function SessionCell({ session, status, label }: SessionCellProps) {
  if (!session || !status) {
    return (
      <span className="font-mono text-xs text-faint">
        <span aria-hidden="true">-</span>
        <span className="sr-only">Not scheduled</span>
      </span>
    );
  }

  const base =
    "inline-flex min-w-14 items-center justify-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-colors";

  if (status === "upcoming") {
    return (
      <span
        title={formatWhen(session.dateStart)}
        className={`${base} border-transparent text-faint`}
      >
        Soon
      </span>
    );
  }

  const live = status === "live";

  return (
    <Link
      to={`/sessions/${session.key}`}
      aria-label={`View ${label}`}
      title={`${session.name} · ${formatWhen(session.dateStart)}`}
      className={`${base} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        live
          ? "border-live/40 text-live hover:bg-live/10"
          : "border-accent/30 text-accent hover:border-accent hover:bg-accent hover:text-carbon-100"
      }`}
    >
      {live && <span className="size-1.5 animate-pulse rounded-full bg-live" />}
      {live ? "Live" : "View"}
    </Link>
  );
}

/**
 * RoundRow component that displays a row for a race weekend in the season table.
 */
function RoundRow({ round, columns, now, featured }: RoundRowProps) {
  const { meeting, sessions } = round;
  const badge = featured?.key === meeting.key ? featured.kind : null;

  return (
    <tr className="border-b border-carbon-300 transition-colors last:border-b-0 hover:bg-accent/5">
      <td
        className={`px-3 py-3 font-mono text-xs text-faint tabular-nums ${
          badge ? "shadow-[inset_2px_0_0_0_var(--color-accent)]" : ""
        }`}
      >
        {"R" + String(round.round)}
      </td>

      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{meeting.name}</span>
          {badge && (
            <span
              className={`rounded-sm border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase ${
                badge === "live"
                  ? "border-live/40 text-live"
                  : "border-accent/40 text-accent"
              }`}
            >
              {badge === "live" ? "Live" : "Next"}
            </span>
          )}
        </div>
        <div className="mt-0.5 font-mono text-[11px] tracking-wider text-faint uppercase">
          {meeting.circuit ?? meeting.location} · {meeting.country}
        </div>
      </td>

      <td className="px-3 py-3 text-right font-mono text-xs whitespace-nowrap text-muted tabular-nums">
        {formatDateRange(meeting.dateStart, meeting.dateEnd)}
      </td>

      {columns.map((col) => {
        const session = sessions.find((s) => s.name === col.name);
        return (
          <td key={col.name} className="px-1 py-2 text-center">
            <SessionCell
              session={session}
              status={session ? getSessionStatus(session, now) : null}
              label={`${meeting.name} ${col.name}`}
            />
          </td>
        );
      })}
    </tr>
  );
}

export default function SeasonTable({
  year,
  rounds,
  columns,
  now,
  featured,
}: SeasonTableProps) {
  return (
    <div className="relative overflow-x-auto rounded-sm border border-accent/20 bg-carbon-200">
      <span className="pointer-events-none absolute top-0 left-0 size-2 border-t border-l border-accent" />
      <span className="pointer-events-none absolute top-0 right-0 size-2 border-t border-r border-accent" />

      <table className="w-full min-w-176 border-collapse text-left">
        <caption className="sr-only">
          Formula 1 {year} sessions by race weekend
        </caption>
        <thead>
          <tr className="border-b border-accent/10 bg-accent/5 font-mono text-[10px] tracking-widest text-muted uppercase">
            <th scope="col" className="w-14 px-3 py-3 font-bold">
              Rd
            </th>
            <th scope="col" className="px-3 py-3 font-bold">
              Grand Prix
            </th>
            <th scope="col" className="px-3 py-3 text-right font-bold">
              Dates
            </th>
            {columns.map((c) => (
              <th
                key={c.name}
                scope="col"
                className="w-20 px-1 py-3 text-center font-bold"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rounds.map((r) => (
            <RoundRow
              key={r.meeting.key}
              round={r}
              columns={columns}
              now={now}
              featured={featured}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
