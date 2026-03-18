import { apiClient } from "./client";
import type { RaceWeekendData } from "../types/f1";

export const race = {
  /**
   * Fetches the current or next race weekend from the backend.
   */
  getRaceWeekend: async (): Promise<RaceWeekendData> => {
    const { data } = await apiClient.get<RaceWeekendData>("/api/race/weekend");
    return data;
  },
};
