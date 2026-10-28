import type { RaceEvent } from "../types";
import { formatElapsed } from "../utils/replay";
import { EVENT_KIND_LABEL, eventMarkerClass } from "../utils/raceFeed";

interface RaceFeedProps {
  events: RaceEvent[];
  startMs: number;
}

function elapsedLabel(date: string, startMs: number): string {
  const elapsed = Date.parse(date) - startMs;
  return elapsed < 0 ? "PRE" : formatElapsed(elapsed);
}

export function RaceFeed({ events, startMs }: RaceFeedProps) {
  if (events.length === 0) {
    return (
      <p className="p-4 font-mono text-xs tracking-widest text-muted uppercase">
        No events yet
      </p>
    );
  }

  return (
    <ol aria-label="Race events" className="divide-y divide-carbon-300">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3 px-3 py-2">
          <span
            aria-hidden="true"
            className={`mt-1 h-3 w-1 shrink-0 rounded-sm ${eventMarkerClass(event)}`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted uppercase">
              <span>{EVENT_KIND_LABEL[event.kind]}</span>
              {event.driver && (
                <span
                  className="font-bold"
                  style={{ color: event.driver.teamColour }}
                >
                  {event.driver.acronym}
                </span>
              )}
              <span className="ml-auto shrink-0 tabular-nums text-faint">
                {event.lapNumber !== null && `L${event.lapNumber} - `}
                {elapsedLabel(event.date, startMs)}
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-snug wrap-break-word text-body">
              {event.message}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
