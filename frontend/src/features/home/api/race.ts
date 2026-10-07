import { apiClient } from "../../../shared/api/client.ts";
import type { RaceWeekendData } from "../../../shared/types/f1.ts";

export const race = {
  /**
   * Fetches the current or next race weekend from the backend.
   */
  getRaceWeekend: async (): Promise<RaceWeekendData> => {
    const { data } = await apiClient.get<RaceWeekendData>("/api/race/weekend");
    return data;
  },
};
