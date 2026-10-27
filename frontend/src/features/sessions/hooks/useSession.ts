import { skipToken, useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";
import { sessionsApi } from "../api/sessions";

export function useSession(sessionKey: number | null) {
  const query = useQuery({
    queryKey: ["session", sessionKey],
    queryFn:
      sessionKey === null
        ? skipToken
        : ({ signal }) => sessionsApi.getSession(sessionKey, { signal }),
    staleTime: Infinity,
  });

  return {
    data: query.data ?? null,
    loading: query.isPending && sessionKey !== null,
    error: query.error ? getErrorMessage(query.error) : null,
  };
}
