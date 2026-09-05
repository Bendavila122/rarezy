import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { themeFor } from "@/lib/watchTiles";

const GRID_SIZE = 9;
const BRAND_POOL = [2, 4, 8, 16, 32, 64, 128, 256, 512];
const REVEAL_MS = 550;
const GAP_MS = 180;
const START_LENGTH = 3;

function shuffledIndices(n: number) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Phase = "showing" | "input" | "over";

/**
 * Remember the Collection: a sequence of grid positions lights up briefly,
 * then disappears — the player has to tap them back in the same order.
 * Every completed round adds one more step, up to the size of the board.
 * One wrong tap ends the run outright (no partial credit for the round in
 * progress, though everything banked from earlier rounds stays) — there's
 * nothing to screenshot your way through, since the sequence is gone by
 * the time a still image of it would be any use.
 */
export function MemoryGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [cellValues] = useState(() =>
    Array.from({ length: GRID_SIZE }, () => BRAND_POOL[Math.floor(Math.random() * BRAND_POOL.length)]!),
  );
  const [round, setRound] = useState(1);
  const [sequence, setSequence] = useState<number[]>(() => shuffledIndices(GRID_SIZE).slice(0, START_LENGTH));
  const [litIndex, setLitIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("showing");
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);

  const scoreRef = useRef(0);
  const finished = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const schedule = (fn: () => void, delay: number) => {
    const timerId = window.setTimeout(fn, delay);
    timers.current.push(timerId);
  };

  useEffect(() => {
    clearTimers();
    setPhase("showing");
    setProgress(0);
    setLitIndex(null);
    setWrongIndex(null);
    sequence.forEach((idx, i) => {
      schedule(() => setLitIndex(idx), i * (REVEAL_MS + GAP_MS));
      schedule(() => setLitIndex(null), i * (REVEAL_MS + GAP_MS) + REVEAL_MS);
    });
    schedule(() => setPhase("input"), sequence.length * (REVEAL_MS + GAP_MS) + 150);
    return clearTimers;
  }, [sequence]);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    clearTimers();
    setPhase("over");
    window.setTimeout(() => onComplete(scoreRef.current), 700);
  };

  const tap = (index: number) => {
    if (phase !== "input") return;
    if (index === sequence[progress]) {
      const nextProgress = progress + 1;
      setProgress(nextProgress);
      if (nextProgress === sequence.length) {
        scoreRef.current += round * 100;
        setScore(scoreRef.current);
        const nextRound = round + 1;
        const nextLength = Math.min(GRID_SIZE, START_LENGTH + nextRound - 1);
        schedule(() => {
          setRound(nextRound);
          setSequence(shuffledIndices(GRID_SIZE).slice(0, nextLength));
        }, 500);
      }
      return;
    }
    setWrongIndex(index);
    finish();
  };

  const concede = () => {
    if (finished.current) return;
    finished.current = true;
    clearTimers();
    setPhase("over");
    window.setTimeout(() => onComplete(scoreRef.current), 400);
  };

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex w-full max-w-[22rem] items-end justify-between">
        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">Score</p>
          <p className="tabular text-[1.6rem] font-bold leading-none tracking-[-0.02em] text-foreground">{score}</p>
        </div>
        <div className="text-right">
          <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">Round</p>
          <p className="tabular text-[1rem] font-semibold text-foreground">{round}</p>
        </div>
      </div>

      {phase !== "over" ? (
        <p className="max-w-[22rem] text-center text-[0.8rem] font-medium text-foreground">
          {phase === "showing" ? "Watch the sequence…" : `Repeat it — ${progress}/${sequence.length}`}
        </p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">Wrong tile</p>
          <p className="tabular text-[1.05rem] font-semibold text-foreground">Final score {score}</p>
        </motion.div>
      )}

      <div className="grid w-full max-w-[16rem] grid-cols-3 gap-2">
        {cellValues.map((value, i) => {
          const theme = themeFor(value);
          const isLit = litIndex === i;
          const isWrong = wrongIndex === i;
          return (
            <button
              key={i}
              type="button"
              disabled={phase !== "input"}
              onClick={() => tap(i)}
              className={`flex aspect-square items-center justify-center rounded-none p-2 transition-all ${
                isLit ? "scale-105 ring-2 ring-mint" : isWrong ? "ring-2 ring-red-500" : ""
              }`}
              style={{ background: theme.bg, opacity: phase === "input" || isLit ? 1 : 0.55 }}
            >
              {theme.logo && (
                <div className="flex h-[64%] w-[80%] items-center justify-center rounded-none bg-white p-1 shadow-sm">
                  <img src={theme.logo} alt={theme.brand} className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {phase === "input" && (
        <button type="button" onClick={concede} className="text-[0.7rem] text-muted underline underline-offset-2">
          Bank score &amp; end
        </button>
      )}
    </div>
  );
}
