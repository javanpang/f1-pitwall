import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { RaceFeed } from "./RaceFeed";
import type { RaceEvent } from "../types";

afterEach(cleanup);

const START = Date.parse("2026-01-01T12:00:00.000Z");

const events: RaceEvent[] = [
  {
    id: "pit-0",
    date: "2026-01-01T12:05:30.000Z",
    kind: "pit",
    flag: null,
    lapNumber: 4,
    message: "PIT STOP - 2.4s stationary",
    driver: { number: 44, acronym: "HAM", teamColour: "#E80020" },
  },
  {
    id: "rc-0",
    date: "2026-01-01T11:50:00.000Z",
    kind: "other",
    flag: null,
    lapNumber: null,
    message: "PIT EXIT OPEN",
    driver: null,
  },
];

describe("RaceFeed", () => {
  it("shows an empty state", () => {
    render(<RaceFeed events={[]} startMs={START} />);
    expect(screen.getByText(/no events yet/i)).toBeInTheDocument();
  });

  it("renders each event with its driver, lap and elapsed time", () => {
    render(<RaceFeed events={events} startMs={START} />);
    const [pit, pre] = within(
      screen.getByRole("list", { name: "Race events" }),
    ).getAllByRole("listitem");

    expect(pit).toHaveTextContent("HAM");
    expect(pit).toHaveTextContent("L4 - 5:30");
    expect(pit).toHaveTextContent("PIT STOP - 2.4s stationary");
    expect(pre).toHaveTextContent("PRE");
  });
});
