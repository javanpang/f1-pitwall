import { apiClient } from "../../../shared/api/client";

export interface SessionDetails {
  key: number;
  name: string;
  type: string;
  dateStart: string;
  dateEnd: string;
}

export const sessionsApi = {
  async getSession(
    sessionKey: number,
    { signal }: { signal?: AbortSignal } = {},
  ): Promise<SessionDetails> {
    const { data } = await apiClient.get<SessionDetails>(
      `api/sessions/${sessionKey}`,
      { signal },
    );
    return data;
  },
};
