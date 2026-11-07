import { apiClient } from "../../../shared/api/client";
import type { Session } from "../../../shared/types/f1";

export const sessionsApi = {
  async getSession(
    sessionKey: number,
    { signal }: { signal?: AbortSignal } = {},
  ): Promise<Session> {
    const { data } = await apiClient.get<Session>(
      `api/sessions/${sessionKey}`,
      { signal },
    );
    return data;
  },
};
