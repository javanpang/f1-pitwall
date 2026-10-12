import { useQuery } from "@tanstack/react-query";
import { trackApi } from "../api/track";
import { getErrorMessage } from "../../../shared/api/getErrorMessage";

export function useTrack(sessionKey: number) {
  const {
    data = null,
    isPending,
    error,
  } = useQuery({
    queryKey: ["track", sessionKey],
    queryFn: () => trackApi.getTrack(sessionKey),
    staleTime: Infinity,
  });

  return {
    data,
    loading: isPending,
    error: error ? getErrorMessage(error) : null,
  };
}
