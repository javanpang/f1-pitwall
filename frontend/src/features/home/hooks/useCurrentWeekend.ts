import { useQuery } from "@tanstack/react-query";
import type { WeekendData } from "../../../shared/types/f1.ts";
import { getErrorMessage } from "../../../shared/api/getErrorMessage.ts";
import { weekendApi } from "../api/weekend.ts";

interface UseCurrentWeekendResult {
  data: WeekendData | null;
  loading: boolean;
  error: string | null;
}

export function useCurrentWeekend(): UseCurrentWeekendResult {
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
