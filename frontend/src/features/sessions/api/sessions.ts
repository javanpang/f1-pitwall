import { apiClient } from "../../../shared/api/client";

export interface SessionDetails {
  sessionKey: number;
  sessionName: string;
  meetingKey: number;
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
