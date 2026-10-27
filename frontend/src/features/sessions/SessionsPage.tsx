import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Logo from "../../shared/components/Logo";

import TrackPanel from "./components/TrackPanel";
import ReplayControls from "./components/ReplayControls";
import { ReplayTimingPanel } from "./components/ReplayTimingPanel";
import { useReplaySession } from "./hooks/useReplay";
import { useSession } from "./hooks/useSession";
import { parseSessionKey, sessionWindow } from "./utils/session";

export default function SessionsPage() {
  const sessionKey = parseSessionKey(useParams().sessionKey);
  const {
    data: session,
    loading: sessionLoading,
    error: sessionError,
  } = useSession(sessionKey);
  const replayWindow = sessionWindow(session);

  useReplaySession(sessionKey, replayWindow?.durationMs ?? 0);

  return (
    <div className="bg-blueprint flex min-h-dvh flex-col bg-carbon-100 text-body xl:h-dvh xl:overflow-hidden">
      {/* ------ Header ------ */}
      <header className="sticky top-0 z-10 w-full shrink-0 px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-3 border-b border-accent/10 bg-carbon-200">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/seasons"
            className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted uppercase transition-colors hover:text-accent"
          >
            <ArrowLeft size={14} />
            <span className="hidden md:inline">Seasons</span>
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-450 grow flex-col gap-4">
        {sessionKey === null ? (
          <p className="font-mono text-xs tracking-widest text-live uppercase">
            Invalid session
          </p>
        ) : (
          <>
            <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,860px)_minmax(0,1fr)]">
              {/* Timing Tower: top left */}
              <section className="min-h-0 min-w-0">
                {replayWindow ? (
                  <ReplayTimingPanel
                    sessionKey={sessionKey}
                    startMs={replayWindow.startMs}
                  />
                ) : sessionLoading ? (
                  <div
                    role="status"
                    aria-label="Loading session"
                    className="h-96 animate-pulse border border-carbon-300 bg-carbon-200"
                  />
                ) : (
                  <div
                    role="alert"
                    className="border border-live/40 bg-carbon-200 p-4 font-mono text-sm text-live"
                  >
                    {sessionError ?? "Replay is unavailable for this session."}
                  </div>
                )}
              </section>

              {/* Track Panel: top right */}
              <section className="min-h-0 min-w-0">
                <TrackPanel sessionKey={sessionKey} />
              </section>
            </div>

            {/* Replay Controls: bottom */}
            <ReplayControls />
          </>
        )}
      </main>
    </div>
  );
}
