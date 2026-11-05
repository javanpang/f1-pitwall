import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getErrorMessage } from "../../../shared/api/getErrorMessage";

import { positionsApi } from "../api/positions";
import { POSITIONS_CHUNK_MS } from "../utils/carPositions";
import { useReplayPosition } from "./useReplay";

const chunkQuery = (sessionKey: number, fromMs: number) => ({
  queryKey: ["positions", sessionKey, fromMs],
  queryFn: ({ signal }: { signal: AbortSignal }) =>
    positionsApi.getPositions(sessionKey, {
      from: new Date(fromMs).toISOString(),
      signal,
    }),
  staleTime: Infinity,
});

/**
 * Loads the car positions chunk for the current replay position and prefetches the next one.
 */
export function useCarPositions(sessionKey: number, startMs: number) {
  const chunkStart = useReplayPosition(POSITIONS_CHUNK_MS);
  const fromMs = startMs + chunkStart;

  const queryClient = useQueryClient();
  const query = useQuery(chunkQuery(sessionKey, fromMs));

  useEffect(() => {
    void queryClient.prefetchQuery(
      chunkQuery(sessionKey, fromMs + POSITIONS_CHUNK_MS),
    );
  }, [queryClient, sessionKey, fromMs]);

  return {
    data: query.data ?? null,
    fromMs,
    error: query.error ? getErrorMessage(query.error) : null,
  };
}
