import { apiClient } from "../../../shared/api/client";
import type { CarPositionsChunk } from "../types";

export const positionsApi = {
  async getPositions(
    sessionKey: number,
    { from, signal }: { from: string; signal?: AbortSignal },
  ): Promise<CarPositionsChunk> {
    const { data } = await apiClient.get<CarPositionsChunk>(
      `/api/sessions/${sessionKey}/positions`,
      { params: { from }, signal },
    );
    return data;
  },
};
