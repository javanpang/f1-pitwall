import { apiClient } from "../../../shared/api/client.ts";
import type { Track } from "../types.ts";

export const trackApi = {
  getTrack: async (sessionKey: number): Promise<Track> => {
    const { data } = await apiClient.get<Track>(
      `/api/sessions/${sessionKey}/track`,
    );
    return data;
  },
};
