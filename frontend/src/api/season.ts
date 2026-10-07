import type { MeetingWithSessions } from "../types/f1";
import { getMockSeason } from "./mock/seasonFixtures";

export const season = {
  // todo(api): replace with
  //   const { data } = await apiClient.get<MeetingWithSessions[]>(`/api/seasons/${year}`);
  //   return data;
  getSeason: (year: number): Promise<MeetingWithSessions[]> =>
    getMockSeason(year),
};
