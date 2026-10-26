import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Logo from "../../shared/components/Logo";

import TrackPanel from "./components/TrackPanel";
import { TimingPanel } from "./components/TimingPanel";
import { parseSessionKey } from "./utils/session";

export default function SessionsPage() {
  const sessionKey = parseSessionKey(useParams().sessionKey);

  return (
    <div className="bg-blueprint flex min-h-screen flex-col bg-carbon-100 text-body">
      {/* ------ Header ------ */}
      <header className="sticky top-0 z-10 w-full px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-3 border-b border-accent/10 bg-carbon-200">
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

      <main className="mx-auto w-full max-w-450 grow px-6 pt-8 pb-16">
        {sessionKey === null ? (
          <p className="font-mono text-xs tracking-widest text-live uppercase">
            Invalid session
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,860px)_minmax(0,1fr)]">
            {/* Timing Tower: top left */}
            <aside className="min-w-0 xl:row-span-2">
              <TimingPanel sessionKey={sessionKey} />
            </aside>

            {/* Track Panel: top right */}
            <section className="min-w-0">
              <TrackPanel sessionKey={sessionKey} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
