import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Season from "./components/Season";
import Logo from "../../shared/components/Logo";

export default function Seasons() {
  return (
    <div className="bg-blueprint flex flex-col min-h-screen bg-carbon-100 text-body">
      {/* ------ Header ------ */}
      <header className="sticky top-0 z-10 w-full px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-3 border-b border-accent/10 bg-carbon-200">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-xs tracking-wider text-muted uppercase transition-colors hover:text-accent"
          >
            <ArrowLeft size={14} />
            <span className="hidden md:inline">Exit</span>
          </Link>
          <Logo size="sm" />
        </div>
      </header>

      {/* ------ Main Content ------ */}
      <main className="mx-auto w-full max-w-350 grow px-6 pt-8 pb-16">
        <Season />
      </main>
    </div>
  );
}
