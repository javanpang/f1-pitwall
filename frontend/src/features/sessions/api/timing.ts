import { apiClient } from "../../../shared/api/client";
import type { TimingRow } from "../types";

interface GetTimingOptions {
  at?: string | null;
  signal?: AbortSignal;
}

export const timingApi = {
  async getTiming(
    sessionKey: number,
    { at, signal }: GetTimingOptions = {},
  ): Promise<TimingRow[]> {
    const { data } = await apiClient.get<TimingRow[]>(
      `/api/sessions/${sessionKey}/timing`,
      { params: at ? { at } : undefined, signal },
    );
    return data;
  },
};
