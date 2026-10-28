import { apiClient } from "../../../shared/api/client";
import type { RaceEvent } from "../types";

export const eventsApi = {
  async getEvents(
    sessionKey: number,
    { signal }: { signal?: AbortSignal } = {},
  ): Promise<RaceEvent[]> {
    const { data } = await apiClient.get<RaceEvent[]>(
      `/api/sessions/${sessionKey}/events`,
      { signal },
    );
    return data;
  },
};
