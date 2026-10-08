import { apiClient } from "../../../shared/api/client.ts";
import type { WeekendData } from "../../../shared/types/f1.ts";

export const weekendApi = {
  /**
   * Fetches the current or next race weekend from the backend.
   */
  getCurrent: async (): Promise<WeekendData> => {
    const { data } = await apiClient.get<WeekendData>("/api/weekends/current");
    return data;
  },
};
