export type WeekendStatus =
  | "upcoming"
  | "session_live"
  | "between_sessions"
  | "weekend_over"
  | "season_over";

export interface Session {
  key: number;
  name: string;
  type: SessionType;
  dateStart: string;
  dateEnd: string | null;
}

export interface Meeting {
  key: number;
  name: string;
  officialName: string | null;
  circuit: string | null;
  country: string;
  location: string;
  dateStart: string;
  dateEnd: string;
  year: number;
}

export interface WeekendData {
  status: WeekendStatus;
  meeting: Meeting;
  sessions: Session[];
  activeSession: Session | null;
  nextSession: Session | null;
  lastSession: Session | null;
}

export interface MeetingWithSessions {
  meeting: Meeting;
  sessions: Session[];
}

export type SessionTypeFilter = "all" | "Practice" | "Qualifying" | "Race";

export type SessionStatus = "finished" | "live" | "upcoming";

export type SessionType = "Practice" | "Qualifying" | "Race";
