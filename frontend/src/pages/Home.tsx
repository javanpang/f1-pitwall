import { Terminal } from "lucide-react";
import RaceCard from "../components/RaceCard";
import { useEffect, useState } from "react";
import { useRaceWeekend } from "../hooks/useRaceWeekend";

function useCountdown(targetIso: string | null) {
  const [display, setDisplay] = useState("--D --H --M --S");

  useEffect(() => {
    if (!targetIso) return;

    const update = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) {
        setDisplay("0D 0H 0M 0S");
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setDisplay(`${d}D ${h}H ${m}M ${s}S`);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return display;
}

export default function Home() {
  const { data } = useRaceWeekend();

  const countdownTarget =
    data?.nextSession?.dateStart ?? data?.activeSession?.dateStart ?? null;

  const countdown = useCountdown(countdownTarget);

  return (
    <div className="min-h-screen bg-[#050608] text-[#E0E0E0] flex flex-col overflow-hidden relative">
      {/* ------ Header ------- */}
      <header className="w-full mx-auto px-6 py-6 flex items-center justify-between relative border-b border-[#00D2BE]/10">
        <div className="flex items-center gap-1">
          {/* Speed lines icon */}
          <div className="flex flex-col items-end gap-0.75">
            <div className="h-0.75 w-6 bg-[#00D2BE]" />
            <div className="h-0.75 w-4 bg-[#00D2BE]" />
            <div className="h-0.75 w-2 bg-[#00D2BE]" />
          </div>

          <h1 className="text-xl font-bold tracking-widest uppercase">
            PIT<span className="text-[#00D2BE]">WALL</span>
          </h1>
        </div>
      </header>

      <main className="grow flex items-center justify-center relative w-full mx-auto px-6 py-12 max-w-350">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Context Label */}
            <div className="flex items-center gap-2 text-[#00D2BE] font-mono text-xs tracking-[0.2em] uppercase -mb-4">
              <Terminal size={14} />
              <span>Race Control Interface</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
              STRATEGY BUILT <br />
              <span className="text-white">FROM THE DATA.</span>
            </h2>

            {/* Countdown Timer */}
            <div className="flex items-center gap-3 font-mono text-sm">
              <div className="flex items-center gap-4 px-4 py-2 bg-[#00D2BE]/5 border border-[#00D2BE]/20 rounded-sm">
                <span className="text-[#555] text-xs uppercase tracking-wider">
                  Race In:
                </span>
                <span className="text-[#00D2BE] font-bold w-35 tabular-nums">
                  {countdown}
                </span>
              </div>
            </div>

            {/* Value Statement */}
            <p className="text-[#9CA3AF] text-lg md:text-xl max-w-2xl font-light border-l-2 border-[#333] pl-6 py-1">
              Lap times, tyre strategies, pit windows, and championship
              standings - pulled from live timing data and visualised for every
              race on the calendar.
            </p>

            {/* CTA */}
            <div className="mt-4 flex flex-col gap-3 w-full">
              <button className="flex items-center justify-between px-8 py-5 bg-[#00D2BE] text-[#050608] text-lg font-bold tracking-wider uppercase rounded-sm transition-all hover:bg-[#00EDD8] cursor-pointer">
                <span>Open Live Pit-Wall</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 8h12M9 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Demo Replay Button */}
              <button className="flex items-center justify-between px-8 py-3 text-[#9CA3AF] text-sm tracking-wider uppercase font-medium border border-[#1F2937] rounded-sm hover:border-[#00D2BE]/30 hover:bg-[#00D2BE]/5 transition-all duration-300 cursor-pointer">
                <span>View Replay</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-5 w-full">
            <RaceCard />
          </div>
        </div>
      </main>
    </div>
  );
}
