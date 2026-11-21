import { apiClient, type RequestOptions } from "../../../shared/api/client";
import type { CarPositionsChunk } from "../types";

interface GetPositionsOptions extends RequestOptions {
  from: string;
}

export const positionsApi = {
  async getPositions(
    sessionKey: number,
    { from, signal }: GetPositionsOptions,
  ): Promise<CarPositionsChunk> {
    const { data } = await apiClient.get<CarPositionsChunk>(
      `/api/sessions/${sessionKey}/positions`,
      { params: { from }, signal },
    );
    return data;
  },
};
