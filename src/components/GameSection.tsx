import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { GamePreview } from "@/components/GamePreview";
import { Reveal } from "@/components/Reveal";

/**
 * The big centred beat after the buyer/seller stories — this is the
 * mechanic itself, given room to breathe rather than squeezed next to a
 * phone mockup. No background of its own, same reason as `PersonaSection`.
 */
export function GameSection({
  score,
  onTry,
  onPlayAgain,
}: {
  score: number | null;
  onTry: () => void;
  onPlayAgain: () => void;
}) {
  return (
    <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
      <div className="floating-orb left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 bg-mint/10" />

      <div className="relative z-[2] mx-auto flex w-full max-w-xl flex-col items-center px-6 py-20 text-center">
        <Reveal>
          <p className="flex items-center justify-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.32em] text-mint">
            <Gamepad2 className="h-3.5 w-3.5" strokeWidth={2.4} />
            The game
          </p>
          <p className="mt-4 text-[1.9rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.5rem]">
            One quick game of skill decides the watch.
          </p>
          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-white/55 sm:text-[1rem]">
            Slide and merge matching tiles to climb the board. No luck of the draw — the best score on the
            leaderboard before the clock runs out wins the watch.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="relative mx-auto mt-10 w-full max-w-xs">
          <div className="floating-orb -left-10 top-1/2 h-48 w-48 -translate-y-1/2 bg-mint/20" />
          <div
            className="floating-orb -right-10 top-1/4 h-40 w-40 bg-amber-400/15"
            style={{ animationDelay: "-3s" }}
          />

          {score !== null ? (
            <div className="glass-dark relative rounded-none p-6 text-center sm:p-8">
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/50">You scored</p>
              <p className="tabular mt-1 text-[2.4rem] font-bold leading-none text-white">{score}</p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={onPlayAgain}
                  className="press flex-1 rounded-none bg-white/10 py-3 text-[0.8rem] font-medium text-white"
                >
                  Again
                </button>
                <Link
                  to="/browse"
                  className="brand-glow press flex-1 rounded-none bg-mint py-3 text-center text-[0.8rem] font-semibold text-brand-deep"
                >
                  Play for real
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative">
              <GamePreview />
              <button
                type="button"
                onClick={onTry}
                className="brand-glow press mt-3 block w-full rounded-none bg-mint py-3.5 text-center text-[0.85rem] font-bold text-brand-deep"
              >
                Try before you buy
              </button>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
