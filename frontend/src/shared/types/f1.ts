export type SessionType = "Practice" | "Qualifying" | "Race";

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

export interface MeetingWithSessions {
  meeting: Meeting;
  sessions: Session[];
}
