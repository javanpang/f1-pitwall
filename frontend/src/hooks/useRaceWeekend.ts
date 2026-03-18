import { useEffect, useState } from "react";
import type { RaceWeekendData } from "../types/f1";
import { race } from "../api/race";

interface UseRaceWeekendResult {
  data: RaceWeekendData | null;
  loading: boolean;
  error: string | null;
}

export function useRaceWeekend(): UseRaceWeekendResult {
  const [data, setData] = useState<RaceWeekendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    race
      .getRaceWeekend()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        setError(err?.response?.data?.error ?? err.message ?? "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
