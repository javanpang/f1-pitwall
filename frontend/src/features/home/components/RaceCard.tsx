import { Activity, Clock, MapPin, Radio } from "lucide-react";
import { useRaceWeekend } from "../hooks/useRaceWeekend.ts";
import type {
  RaceSession,
  RaceWeekendStatus,
} from "../../../shared/types/f1.ts";

function formatTime(iso: string): string {
  return (
    new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC"
  );
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const month = s.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
  return `${s.getUTCDate()}-${e.getUTCDate()} ${month}`;
}

function getSessionLabel(session: RaceSession | null): string {
  if (!session) return "-";
  return session.name.toUpperCase();
}

function getSessionSubtext(session: RaceSession | null): string {
  if (!session) return "";
  return formatTime(session.dateStart);
}

const STATUS_LABEL: Record<RaceWeekendStatus, string> = {
  session_live: "LIVE NOW",
  between_sessions: "BETWEEN SESSIONS",
  upcoming: "NEXT RACE WEEKEND",
  weekend_over: "WEEKEND OVER",
  season_over: "SEASON OVER",
};

// Skeleton
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-[#1A1D24] rounded-sm ${className ?? ""}`} />
);

const DataPoint = ({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  sub: string | null;
}) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 text-[#555] mb-1">
      {icon}
      <span className="text-[10px] font-bold tracking-wider">{label}</span>
    </div>
    {value === null ? (
      <>
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-3 w-10" />
      </>
    ) : (
      <>
        <span className="font-mono text-[#E0E0E0] text-sm">{value}</span>
        <span className="font-mono text-[#00D2BE] text-[10px]">{sub}</span>
      </>
    )}
  </div>
);

// Track Map placeholder
const TrackPlaceholder = ({ name }: { name: string }) => (
  <div className="relative w-full bg-[#050608] rounded border border-[#333]/50 overflow-hidden aspect-video">
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <MapPin size={20} className="text-[#333]" />
      <span className="text-[#333] font-mono text-xs tracking-widest uppercase">
        {name}
      </span>
    </div>

    <div className="absolute top-1 left-1 w-3 h-3 border-l border-t border-[#00D2BE]/30" />
    <div className="absolute top-1 right-1 w-3 h-3 border-r border-t border-[#00D2BE]/30" />
    <div className="absolute bottom-1 left-1 w-3 h-3 border-l border-b border-[#00D2BE]/30" />
    <div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b border-[#00D2BE]/30" />
  </div>
);

export default function RaceCard() {
  const { data, loading, error } = useRaceWeekend();

  const { meeting, nextSession, activeSession, lastSession, status } =
    data ?? {};
  const currentSession =
    activeSession ??
    nextSession ??
    (status === "weekend_over" || status === "season_over"
      ? lastSession
      : null);

  return (
    <div className="relative w-full bg-[#0A0C10] border border-[#00D2BE]/20 rounded-sm overflow-hidden">
      {/* Corner Markers */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-[#00D2BE]" />
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-[#00D2BE]" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-[#00D2BE]" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#00D2BE]" />

      {/* Header */}
      <div className="bg-[#00D2BE]/5 border-b border-[#00D2BE]/10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[#00D2BE]" />
          <span className="text-[#00D2BE] font-mono text-xs font-bold tracking-widest">
            {STATUS_LABEL[status ?? "upcoming"]}
          </span>
        </div>
        {error && (
          <span className="text-red-400 font-mono text-[10px] tracking-wider">
            FEED ERROR
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex flex-col gap-1 mb-6">
          {loading ? (
            <>
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-white tracking-wide uppercase">
                {meeting?.name ?? "-"}
              </h3>
              <span className="text-[#9CA3AF] text-sm font-light">
                {meeting?.location ?? "-"}, {meeting?.country ?? "-"}
              </span>
            </>
          )}
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 border-t border-b border-[#333] py-4">
          <DataPoint
            icon={<Clock size={14} />}
            label="DATE"
            value={
              loading
                ? null
                : meeting
                  ? formatDateRange(meeting.dateStart, meeting.dateEnd)
                  : "-"
            }
            sub={
              loading
                ? null
                : meeting
                  ? `${new Date(meeting.dateStart).getUTCFullYear()}`
                  : "-"
            }
          />
          <DataPoint
            icon={<Radio size={14} />}
            label="SESSION"
            value={loading ? null : getSessionLabel(currentSession ?? null)}
            sub={loading ? null : getSessionSubtext(currentSession ?? null)}
          />
          <DataPoint
            icon={<MapPin size={14} />}
            label="Circuit"
            value={
              loading ? null : (meeting?.circuit ?? meeting?.location ?? "-")
            }
            sub={loading ? null : (meeting?.country ?? "-")}
          />
        </div>

        {/* Track Map */}
        <TrackPlaceholder
          name={meeting?.circuit ?? meeting?.name ?? "Circuit"}
        />
      </div>
    </div>
  );
}
