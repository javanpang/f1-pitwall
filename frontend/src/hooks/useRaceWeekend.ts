import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { RaceWeekendData } from "../types/f1";
import { race } from "../api/race";

interface UseRaceWeekendResult {
  data: RaceWeekendData | null;
  loading: boolean;
  error: string | null;
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) return error.response?.data?.error ?? error.message;
  return error instanceof Error ? error.message : "Unknown error";
}

export function useRaceWeekend(): UseRaceWeekendResult {
  const {
    data = null,
    isPending,
    error,
  } = useQuery({
    queryKey: ["race", "weekend"],
    queryFn: race.getRaceWeekend,
    refetchInterval: (query) =>
      query.state.data?.status === "session_live" ? 30_000 : false,
  });
  return {
    data,
    loading: isPending,
    error: error ? getErrorMessage(error) : null,
  };
}
