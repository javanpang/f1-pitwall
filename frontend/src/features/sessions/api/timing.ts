import { apiClient, type RequestOptions } from "../../../shared/api/client";
import type { TimingRow } from "../types";

interface GetTimingOptions extends RequestOptions {
  at?: string | null;
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
