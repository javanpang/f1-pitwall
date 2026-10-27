import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ReplayControls, { Timeline } from "./ReplayControls";
import { useReplayStore } from "../stores/replayStore";

const store = () => useReplayStore.getState();

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
  });
  store().reset();
});

afterEach(() => {
  cleanup();
  store().reset();
  vi.useRealTimers();
});

function loadSession() {
  store().setDuration(3_600_000);
  store().seek(65_000);
}

describe("ReplayControls", () => {
  it("toggles playback and reflects it in the button label", () => {
    loadSession();
    render(<ReplayControls />);

    fireEvent.click(screen.getByRole("button", { name: "Play replay" }));

    expect(store().playing).toBe(true);
    expect(
      screen.getByRole("button", { name: "Pause replay" }),
    ).toBeInTheDocument();
  });

  it("sets the replay speed", () => {
    loadSession();
    render(<ReplayControls />);

    fireEvent.click(screen.getByRole("button", { name: "4x" }));

    expect(store().speed).toBe(4);
  });

  it("seeks from the timeline with the keyboard", () => {
    loadSession();
    render(<ReplayControls />);

    fireEvent.keyDown(screen.getByRole("slider", { name: "Replay position" }), {
      key: "ArrowRight",
    });

    expect(store().position).toBe(70_000); // 65_000 + 5_000 step
  });

  it("shows the current position and duration", () => {
    loadSession();
    render(<ReplayControls />);

    expect(screen.getByText("1:05")).toBeInTheDocument();
  });

  it("disables everything when there is no duration", () => {
    render(<ReplayControls />);

    expect(screen.getByRole("button", { name: "Play replay" })).toBeDisabled();
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-disabled", "true");

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(store().position).toBe(0);
  });
});

describe("Timeline", () => {
  it("exposes progress to assistive tech", () => {
    render(
      <Timeline
        position={65_000}
        duration={3_600_000}
        disabled={false}
        onSeek={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("slider", { name: "Replay position" }),
    ).toHaveAttribute("aria-valuetext", "1:05 of 1:00:00");
  });

  it("requests a position from the keyboard", () => {
    const onSeek = vi.fn();
    render(
      <Timeline
        position={60_000}
        duration={3_600_000}
        disabled={false}
        onSeek={onSeek}
      />,
    );
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onSeek).toHaveBeenLastCalledWith(65_000);

    fireEvent.keyDown(slider, { key: "ArrowLeft", shiftKey: true });
    expect(onSeek).toHaveBeenLastCalledWith(30_000);

    fireEvent.keyDown(slider, { key: "End" });
    expect(onSeek).toHaveBeenLastCalledWith(3_600_000);
  });

  it("ignores input when disabled", () => {
    const onSeek = vi.fn();
    render(<Timeline position={0} duration={0} disabled onSeek={onSeek} />);
    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(onSeek).not.toHaveBeenCalled();
  });
});
