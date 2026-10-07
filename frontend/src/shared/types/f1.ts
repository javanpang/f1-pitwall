export type RaceWeekendStatus =
  | "upcoming"
  | "session_live"
  | "between_sessions"
  | "weekend_over"
  | "season_over";

export interface RaceSession {
  key: number;
  name: string;
  type:
    | "Practice"
    | "Qualifying"
    | "Race"
    | "Sprint"
    | "Sprint Qualifying"
    | "Sprint Shootout"
    | string;
  dateStart: string;
  dateEnd: string | null;
}

export interface RaceMeeting {
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

export interface RaceWeekendData {
  status: RaceWeekendStatus;
  meeting: RaceMeeting;
  sessions: RaceSession[];
  activeSession: RaceSession | null;
  nextSession: RaceSession | null;
  lastSession: RaceSession | null;
}

export interface MeetingWithSessions {
  meeting: RaceMeeting;
  sessions: RaceSession[];
}

export type SessionTypeFilter = "all" | "Practice" | "Qualifying" | "Race";

export type SessionStatus = "finished" | "live" | "upcoming";
