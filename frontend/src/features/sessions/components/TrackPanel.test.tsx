import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import TrackPanel from "./TrackPanel.tsx";
import { useTrack } from "../hooks/useTrack.ts";

vi.mock("../hooks/useTrack.ts");

afterEach(cleanup);
beforeEach(() => vi.resetAllMocks());

describe("TrackPanel", () => {
  it("shows a loading state", () => {
    vi.mocked(useTrack).mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });
    render(<TrackPanel sessionKey={1} />);
    expect(
      screen.getByRole("status", { name: "Loading track" }),
    ).toBeInTheDocument();
  });

  it("shows the backend's error message", () => {
    vi.mocked(useTrack).mockReturnValue({
      data: null,
      loading: false,
      error: "Track data is not available for this session.",
    });
    render(<TrackPanel sessionKey={1} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/not available/i);
  });

  it("renders the map once data arrives", () => {
    vi.mocked(useTrack).mockReturnValue({
      data: {
        circuitKey: 1,
        circuitName: "Silverstone",
        year: 2026,
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 },
        ],
      },
      loading: false,
      error: null,
    });
    render(<TrackPanel sessionKey={1} />);
    expect(
      screen.getByRole("img", { name: "Track map of Silverstone" }),
    ).toBeInTheDocument();
  });
});
