import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Logo from "../../shared/components/Logo";

import { DataPanel } from "../../shared/components/DataPanel.tsx";
import { TrackMapPanel } from "./components/TrackMapPanel.tsx";
import ReplayControls from "./components/ReplayControls.tsx";
import { TimingTowerPanel } from "./components/TimingTowerPanel.tsx";
import { RaceFeedPanel } from "./components/RaceFeedPanel.tsx";
import { GapChartPanel } from "./components/GapChartPanel.tsx";

import { useReplaySession } from "./hooks/useReplay.ts";
import { useSession } from "./hooks/useSession.ts";
import { parseSessionKey, sessionWindow } from "./utils/session.ts";

export default function SessionsPage() {
  const sessionKey = parseSessionKey(useParams().sessionKey);
  const sessionState = useSession(sessionKey);
  const replayWindow = sessionWindow(sessionState.data);

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

      <main className="mx-auto flex min-h-0 w-full max-w-450 grow flex-col">
        {sessionKey === null ? (
          <p className="font-mono text-xs tracking-widest text-live uppercase">
            Invalid session
          </p>
        ) : (
          <DataPanel
            label="Session"
            state={sessionState}
            isEmpty={(session) => sessionWindow(session) === null}
            emptyMessage="Replay is unavailable for this session."
            className="flex-1 border-0 bg-transparent"
          >
            {(session) => {
              const { startMs } = sessionWindow(session)!;

              const cell = "flex min-h-0 min-w-0 flex-col overflow-hidden";

              return (
                <>
                  <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-rows-2 xl:grid-cols-38 xl:grid-rows-2">
                    {/* Timing Tower: top left */}
                    <section
                      className={`${cell} lg:col-span-2 xl:col-span-15 xl:row-start-1`}
                    >
                      <TimingTowerPanel
                        sessionKey={sessionKey}
                        startMs={startMs}
                      />
                    </section>

                    {/* Middle: Track Map */}
                    <section
                      className={`${cell} aspect-square xl:aspect-auto xl:col-span-15 xl:row-start-1`}
                    >
                      <TrackMapPanel
                        sessionKey={sessionKey}
                        startMs={startMs}
                      />
                    </section>

                    {/* Right: Race Feed */}
                    <section
                      className={`${cell} lg:h-0 lg:min-h-full xl:h-auto xl:min-h-0 xl:col-span-8 xl:col-start-31 xl:row-span-2 xl:row-start-1`}
                    >
                      <RaceFeedPanel
                        sessionKey={sessionKey}
                        startMs={startMs}
                      />
                    </section>

                    <section
                      className={`${cell} xl:col-span-30 xl:col-start-1 xl:row-start-2`}
                    >
                      <GapChartPanel
                        sessionKey={sessionKey}
                        startMs={startMs}
                      />
                    </section>
                  </div>

                  {/* Replay Controls: bottom */}
                  <ReplayControls />
                </>
              );
            }}
          </DataPanel>
        )}
      </main>
    </div>
  );
}
