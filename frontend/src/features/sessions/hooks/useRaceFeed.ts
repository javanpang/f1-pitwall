import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";
import { eventsApi } from "../api/events";

export function useRaceFeed(sessionKey: number) {
  const query = useQuery({
    queryKey: ["events", sessionKey],
    queryFn: ({ signal }) => eventsApi.getEvents(sessionKey, { signal }),
    staleTime: Infinity,
  });

  return {
    data: query.data ?? null,
    loading: query.isPending,
    error: query.error ? getErrorMessage(query.error) : null,
  };
}
