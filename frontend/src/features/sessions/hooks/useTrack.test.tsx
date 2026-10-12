import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useTrack } from "./useTrack.ts";
import { trackApi } from "../api/track.ts";
import type { Track } from "../types.ts";

vi.mock("../api/track.ts", () => ({ trackApi: { getTrack: vi.fn() } }));

const fixture: Track = {
  circuitKey: 1,
  circuitName: "Test Circuit",
  year: 2026,
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
};

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("useTrack", () => {
  beforeEach(() => vi.resetAllMocks());

  it("fetches the track for the given session", async () => {
    vi.mocked(trackApi.getTrack).mockResolvedValue(fixture);

    const { result } = renderHook(() => useTrack(42), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(trackApi.getTrack).toHaveBeenCalledWith(42);
    expect(result.current.data).toEqual(fixture);
  });

  it("exposes an error message when the request fails", async () => {
    vi.mocked(trackApi.getTrack).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTrack(42), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBe("Network error"));
    expect(result.current.data).toBeNull();
  });
});
