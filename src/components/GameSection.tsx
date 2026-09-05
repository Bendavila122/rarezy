import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";
import { GAMES, type GameId, gameById } from "@/lib/games";
import { gameModule } from "@/components/GameRegistry";
import { Reveal } from "@/components/Reveal";

/**
 * The mechanic itself, given room to breathe rather than squeezed next to a
 * phone mockup — a horizontal carousel showing one game from the catalog
 * at a time (its own live real-engine preview, its own "try before you
 * buy"), rather than every game crammed into a grid at once. Which one
 * actually decides a given competition is the seller's choice at listing
 * time (see `GameId` on `CompetitionListing`) and is fixed for that
 * competition until it ends — this section is where a visitor gets to
 * step through and compare them before ever buying a ticket.
 */
export function GameSection({
  result,
  onTry,
}: {
  result: { gameId: GameId; score: number } | null;
  onTry: (id: GameId) => void;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const game = GAMES[index]!;
  const { Preview } = gameModule(game.id);

  const go = (delta: number) => {
    setDirection(delta);
    setIndex((i) => (i + delta + GAMES.length) % GAMES.length);
  };

  const jump = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  return (
    <div className="relative z-10 overflow-hidden">
      <div className="floating-orb left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 bg-mint/10" />

      <div className="relative z-[2] mx-auto w-full max-w-2xl px-6 py-16">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="flex items-center justify-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.32em] text-mint">
            <Gamepad2 className="h-3.5 w-3.5" strokeWidth={2.4} />
            The games
          </p>
          <p className="mt-4 text-[1.9rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.5rem]">
            Every ticket, a real game of skill.
          </p>
          <p className="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-white/55 sm:text-[1rem]">
            Every competition runs on one of these, chosen by the seller when they list it and locked in for
            that competition until it ends. No luck of the draw, ever.
          </p>
        </Reveal>

        <div className="mt-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous game"
            className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
          </button>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={game.id}
                custom={direction}
                initial={{ opacity: 0, x: 48 * direction }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -48 * direction }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="glass-dark flex flex-col rounded-none p-5 sm:p-6"
              >
                <p className="text-[1rem] font-semibold tracking-tight text-white">{game.name}</p>
                <p className="mt-1 text-[0.78rem] text-white/55">{game.tagline}</p>
                <div className="mt-4">
                  <Preview />
                </div>
                <p className="mt-4 text-[0.78rem] leading-relaxed text-white/55">{game.description}</p>
                <button
                  type="button"
                  onClick={() => onTry(game.id)}
                  className="brand-glow press mt-4 block w-full rounded-none bg-mint py-3 text-center text-[0.85rem] font-bold text-brand-deep"
                >
                  Try before you buy
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next game"
            className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {GAMES.map((g, i) => (
            <button
              key={g.id}
              type="button"
              aria-label={`Show ${g.name}`}
              onClick={() => jump(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-mint" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>

        {result && (
          <Reveal delay={0.1} className="relative mx-auto mt-8 w-full max-w-xs">
            <div className="glass-dark relative rounded-none p-6 text-center sm:p-8">
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/50">
                You scored, playing {gameById(result.gameId).name}
              </p>
              <p className="tabular mt-1 text-[2.4rem] font-bold leading-none text-white">{result.score}</p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => onTry(result.gameId)}
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
          </Reveal>
        )}
      </div>
    </div>
  );
}
