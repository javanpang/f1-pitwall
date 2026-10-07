import type { MeetingWithSessions } from "../../../shared/types/f1.ts";
import { apiClient } from "../../../shared/api/client.ts";

export const season = {
  getSeason: async (year: number): Promise<MeetingWithSessions[]> => {
    const { data } = await apiClient.get<MeetingWithSessions[]>(
      `/api/seasons/${year}`,
    );
    return data;
  },
};
