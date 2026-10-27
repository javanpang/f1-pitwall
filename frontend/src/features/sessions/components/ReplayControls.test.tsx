import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ReplayControls, { Timeline } from "./ReplayControls";

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

const props = {
  playing: false,
  speed: 1 as const,
  position: 65_000,
  duration: 3_600_000,
  onTogglePlay: vi.fn(),
  onSpeedChange: vi.fn(),
  onSeek: vi.fn(),
};

describe("ReplayControls", () => {
  it("toggles play and reflects state in its label", () => {
    const { rerender } = render(<ReplayControls {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Play replay" }));
    expect(props.onTogglePlay).toHaveBeenCalledTimes(1);

    rerender(<ReplayControls {...props} playing />);
    expect(
      screen.getByRole("button", { name: "Pause replay" }),
    ).toBeInTheDocument();
  });

  it("reports the selected speed", () => {
    render(<ReplayControls {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "4x" }));
    expect(props.onSpeedChange).toHaveBeenCalledWith(4);
  });

  it("seeks from the timeline with the keyboard", () => {
    render(<ReplayControls {...props} />);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Replay position" }), {
      key: "ArrowRight",
    });
    expect(props.onSeek).toHaveBeenCalledWith(70_000); // 65_000 + 5_000 step
  });

  it("disables everything when there is no duration", () => {
    render(<ReplayControls {...props} duration={0} />);
    expect(screen.getByRole("button", { name: "Play replay" })).toBeDisabled();
    expect(screen.getByRole("slider")).toHaveAttribute("aria-disabled", "true");

    fireEvent.keyDown(screen.getByRole("slider"), { key: "ArrowRight" });
    expect(props.onSeek).not.toHaveBeenCalled();
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
