import { apiClient, type RequestOptions } from "../../../shared/api/client";
import type { PitStop } from "../types";

export const pitStopsApi = {
  async getPitStops(
    sessionKey: number,
    { signal }: RequestOptions = {},
  ): Promise<PitStop[]> {
    const { data } = await apiClient.get<PitStop[]>(
      `/api/sessions/${sessionKey}/pit-stops`,
      { signal },
    );
    return data;
  },
};
