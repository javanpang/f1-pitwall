import type { MeetingWithSessions } from "../types/f1";
import { apiClient } from "./client";

export const season = {
  getSeason: async (year: number): Promise<MeetingWithSessions[]> => {
    const { data } = await apiClient.get<MeetingWithSessions[]>(
      `/api/seasons/${year}`,
    );
    return data;
  },
};
