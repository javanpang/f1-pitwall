import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { WeekendData } from "../../../shared/types/f1.ts";
import { weekendApi } from "../api/weekend.ts";

interface UseCurrentWeekendResult {
  data: WeekendData | null;
  loading: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) return error.response?.data?.error ?? error.message;
  return error instanceof Error ? error.message : "Unknown error";
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
