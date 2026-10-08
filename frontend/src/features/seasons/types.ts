import type { MeetingWithSessions, SessionType } from "../../shared/types/f1";

export type SessionTypeFilter = "all" | SessionType;

export type SessionStatus = "finished" | "live" | "upcoming";

export interface SessionColumn {
  name: string;
  label: string;
  type: SessionType;
}

export interface Round extends MeetingWithSessions {
  round: number;
}
export interface FeaturedRound {
  key: number;
  kind: "live" | "next";
}
