import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";
import { lapGapsApi } from "../api/lapGaps";

/** Fetch all lap gaps for a session. */
export function useLapGaps(sessionKey: number) {
  const {
    data = null,
    isPending,
    error,
  } = useQuery({
    queryKey: ["lap-gaps", sessionKey],
    queryFn: ({ signal }) => lapGapsApi.getLapGaps(sessionKey, { signal }),
    staleTime: Infinity,
  });

  return {
    data,
    loading: isPending,
    error: error ? getErrorMessage(error) : null,
  };
}
