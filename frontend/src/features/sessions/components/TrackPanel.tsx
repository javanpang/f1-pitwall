import type { ReactNode } from "react";
import { useTrack } from "../hooks/useTrack.ts";
import TrackMap from "./TrackMap.tsx";

export default function TrackPanel({ sessionKey }: { sessionKey: number }) {
  const { data, loading, error } = useTrack(sessionKey);

  let content: ReactNode;
  if (loading) {
    content = (
      <div
        role="status"
        aria-label="Loading track"
        className="size-full animate-pulse rounded-sm bg-carbon-300"
      />
    );
  } else if (error || !data) {
    content = (
      <p
        role="alert"
        className="font-mono text-xs tracking-widest text-live uppercase"
      >
        Feed error · {error ?? "No track data"}
      </p>
    );
  } else {
    content = (
      <TrackMap
        points={data.points}
        label={`Track map of ${data.circuitName}`}
      />
    );
  }

  return (
    <section
      aria-label="Track map"
      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-sm border border-accent/20 bg-carbon-200 p-6"
    >
      <span className="pointer-events-none absolute top-0 left-0 size-2 border-t border-l border-accent" />
      <span className="pointer-events-none absolute top-0 right-0 size-2 border-t border-r border-accent" />
      {content}
    </section>
  );
}
