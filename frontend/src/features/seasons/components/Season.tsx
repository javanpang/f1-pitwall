import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import SegmentedControl from "./SegmentedControl.tsx";
import { useNow } from "../hooks/useNow.ts";
import { useSeason } from "../hooks/useSeason.ts";
import type { SessionTypeFilter } from "../../../shared/types/f1.ts";
import {
  CURRENT_YEAR,
  TYPE_OPTIONS,
  YEAR_OPTIONS,
  filterByType,
  findFeaturedRound,
  getVisibleColumns,
  withRounds,
} from "../utils/season.ts";
import SeasonTable from "./SeasonTable.tsx";

/**
 * Skeleton component that displays a loading state for the season table.
 */
function TableSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading season"
      className="divide-y divide-carbon-300 rounded-sm border border-accent/20 bg-carbon-200"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <div className="h-3 w-6 animate-pulse rounded-sm bg-carbon-300" />
          <div className="h-4 w-48 animate-pulse rounded-sm bg-carbon-300" />
          <div className="ml-auto h-4 w-64 animate-pulse rounded-sm bg-carbon-300" />
        </div>
      ))}
    </div>
  );
}

/**
 * Notice component that displays a message for empty or error states in the season table.
 */
function Notice({
  tone,
  children,
}: {
  tone: "empty" | "error";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : undefined}
      className={`rounded-sm border px-4 py-10 text-center font-mono text-xs tracking-widest uppercase ${
        tone === "error"
          ? "border-live/30 text-live"
          : "border-carbon-300 text-faint"
      }`}
    >
      {children}
    </p>
  );
}

export default function Season() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [filter, setFilter] = useState<SessionTypeFilter>("all");

  const { data, loading, error } = useSeason(year);
  const now = useNow();

  const rounds = useMemo(() => withRounds(data), [data]);
  const visibleRounds = useMemo(
    () => filterByType(rounds, filter),
    [rounds, filter],
  );
  const columns = getVisibleColumns(filter);
  const featured = findFeaturedRound(rounds, now);

  let content: ReactNode;
  if (loading) {
    content = <TableSkeleton />;
  } else if (error) {
    content = <Notice tone="error">Feed error · {error}</Notice>;
  } else if (rounds.length === 0) {
    content = <Notice tone="empty">No sessions for {year}</Notice>;
  } else if (visibleRounds.length === 0) {
    content = (
      <Notice tone="empty">
        No {filter} sessions for {year}
      </Notice>
    );
  } else {
    content = (
      <SeasonTable
        year={year}
        rounds={visibleRounds}
        columns={columns}
        now={now}
        featured={featured}
      />
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <SegmentedControl
          label="Select season"
          options={YEAR_OPTIONS}
          value={year}
          onChange={setYear}
        />
        <span className="flex-1" />
        <SegmentedControl
          label="Select session type"
          options={TYPE_OPTIONS}
          value={filter}
          onChange={setFilter}
        />
      </div>
      {content}
    </section>
  );
}
