import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";
import { timingApi } from "../api/timing";

const LIVE_POLL_MS = 5_000;

interface UseTimingOptions {
  live?: boolean;
  at?: string | null;
}

export function useTiming(
  sessionKey: number,
  { live = false, at = null }: UseTimingOptions = {},
) {
  const query = useQuery({
    queryKey: ["timing", sessionKey, at],
    queryFn: ({ signal }) => timingApi.getTiming(sessionKey, { at, signal }),
    refetchInterval: live ? LIVE_POLL_MS : false,
    staleTime: live ? 0 : Infinity,
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data ?? null,
    loading: query.isPending,
    error: query.error ? getErrorMessage(query.error) : null,
  };
}
