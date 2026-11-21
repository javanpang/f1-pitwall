import type { Meeting, Session } from "../../shared/types/f1.ts";

export type WeekendStatus =
  | "upcoming"
  | "session_live"
  | "between_sessions"
  | "weekend_over"
  | "season_over";

/**`GET /api/weekends/current` response */
export interface WeekendData {
  status: WeekendStatus;
  meeting: Meeting;
  sessions: Session[];
  activeSession: Session | null;
  nextSession: Session | null;
  lastSession: Session | null;
}
