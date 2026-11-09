import { apiClient } from "../../../shared/api/client";
import type { LapGaps } from "../types";

export const lapGapsApi = {
  async getLapGaps(
    sessionKey: number,
    { signal }: { signal?: AbortSignal } = {},
  ): Promise<LapGaps> {
    const { data } = await apiClient.get<LapGaps>(
      `/api/sessions/${sessionKey}/lap-gaps`,
      { signal },
    );
    return data;
  },
};
