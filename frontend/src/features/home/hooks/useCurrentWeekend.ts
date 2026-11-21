import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../shared/api/getErrorMessage.ts";
import { weekendApi } from "../api/weekend.ts";

export function useCurrentWeekend() {
  const {
    data = null,
    isPending,
    error,
  } = useQuery({
    queryKey: ["weekend", "current"],
    queryFn: weekendApi.getCurrent,
    refetchInterval: (query) =>
      query.state.data?.status === "session_live" ? 30_000 : false,
  });
  return {
    data,
    loading: isPending,
    error: error ? getErrorMessage(error) : null,
  };
}
