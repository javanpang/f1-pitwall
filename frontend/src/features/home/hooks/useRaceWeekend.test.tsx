import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useRaceWeekend } from "./useRaceWeekend.ts";
import { race } from "../api/race.ts";
import type { RaceWeekendData } from "../../../shared/types/f1.ts";

vi.mock("../api/race", () => ({
  race: { getRaceWeekend: vi.fn() },
}));

const fixture: RaceWeekendData = {
  status: "upcoming",
  meeting: {
    key: 1,
    name: "Test Grand Prix",
    officialName: "Test Grand Prix Official",
    circuit: "Test Circuit",
    country: "Test Country",
    location: "Test Location",
    dateStart: "2026-01-01T00:00:00Z",
    dateEnd: "2026-01-03T00:00:00Z",
    year: 2026,
  },
  sessions: [],
  activeSession: null,
  nextSession: null,
  lastSession: null,
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("useRaceWeekend", () => {
  beforeEach(() => vi.resetAllMocks());

  it("shares one request between multiple consumers (Home + RaceCard)", async () => {
    vi.mocked(race.getRaceWeekend).mockResolvedValue(fixture);

    const { result } = renderHook(
      () => ({ home: useRaceWeekend(), card: useRaceWeekend() }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.card.loading).toBe(false));

    expect(race.getRaceWeekend).toHaveBeenCalledTimes(1);
    expect(result.current.home.data).toEqual(fixture);
    expect(result.current.card.data).toEqual(fixture);
  });

  it("exposes an error message when the request fails", async () => {
    vi.mocked(race.getRaceWeekend).mockRejectedValue(
      new Error("Network error"),
    );

    const { result } = renderHook(() => useRaceWeekend(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe("Network error"));
    expect(result.current.data).toBeNull();
  });
});
