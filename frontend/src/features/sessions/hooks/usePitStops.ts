import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";
import { pitStopsApi } from "../api/pitStops";

/** Fetch every pit stop in a session, oldest first. */
export function usePitStops(sessionKey: number) {
  const query = useQuery({
    queryKey: ["pit-stops", sessionKey],
    queryFn: ({ signal }) => pitStopsApi.getPitStops(sessionKey, { signal }),
    staleTime: Infinity,
  });

  return {
    data: query.data ?? null,
    loading: query.isPending,
    error: query.error ? getErrorMessage(query.error) : null,
  };
}
