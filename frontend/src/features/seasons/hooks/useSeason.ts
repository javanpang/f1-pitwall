import { useQuery } from "@tanstack/react-query";
import { season } from "../api/season";
import type { MeetingWithSessions } from "../../../shared/types/f1";

const EMPTY: MeetingWithSessions[] = [];

/**
 * Fetches the season data for a given year. Returns an object containing the data, loading state, and any error message.
 */
export function useSeason(year: number) {
  const {
    data = EMPTY,
    isPending,
    error,
  } = useQuery({
    queryKey: ["season", year],
    queryFn: () => season.getSeason(year),
  });

  return { data, loading: isPending, error: error ? error.message : null };
}
