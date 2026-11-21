import { apiClient, type RequestOptions } from "../../../shared/api/client";
import type { Session } from "../../../shared/types/f1";

export const sessionsApi = {
  async getSession(
    sessionKey: number,
    { signal }: RequestOptions = {},
  ): Promise<Session> {
    const { data } = await apiClient.get<Session>(
      `/api/sessions/${sessionKey}`,
      { signal },
    );
    return data;
  },
};
