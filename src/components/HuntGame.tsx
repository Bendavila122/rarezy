import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { themeFor } from "@/lib/watchTiles";

const GAME_MS = 45_000;
const START_SIDE = 4;
const MAX_SIDE = 8;
const START_WINDOW_MS = 2600;
const MIN_WINDOW_MS = 900;
const WINDOW_STEP_MS = 60;
const BASE_POINTS = 80;
const MAX_BONUS = 160;
const MISS_PENALTY = 30;
const TIMEOUT_PENALTY = 10;

const BRAND_POOL = [2, 4, 8, 16, 32, 64, 128, 256, 512];

function pickTwoDistinct() {
  const a = BRAND_POOL[Math.floor(Math.random() * BRAND_POOL.length)]!;
  let b = BRAND_POOL[Math.floor(Math.random() * BRAND_POOL.length)]!;
  while (b === a) b = BRAND_POOL[Math.floor(Math.random() * BRAND_POOL.length)]!;
  return [a, b] as const;
}

function buildRound(round: number) {
  const side = Math.min(MAX_SIDE, START_SIDE + Math.floor(round / 2));
  const cellCount = side * side;
  const [baseValue, oddValue] = pickTwoDistinct();
  const oddIndex = Math.floor(Math.random() * cellCount);
  const cells = Array.from({ length: cellCount }, () => baseValue);
  cells[oddIndex] = oddValue;
  return { side, cells, oddIndex };
}

/**
 * Find the Millionaire: nearly every tile on the board is the same brand —
 * exactly one is different, and it's the player's job to spot it before
 * the timer runs out. The board grows every couple of rounds (more tiles,
 * smaller and harder to scan), so the visual-search difficulty keeps
 * climbing even though the rule itself never changes. Runs on a flat
 * 45-second clock, same shape as Reflex — a miss or a timeout costs points
 * but the next round starts immediately, no pause to think.
 */
export function HuntGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [round, setRound] = useState(0);
  const [game, setGame] = useState(() => buildRound(0));
  const [windowMs, setWindowMs] = useState(START_WINDOW_MS);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<"hit" | "miss" | null>(null);
  const [msLeft, setMsLeft] = useState(GAME_MS);
  const [over, setOver] = useState(false);

  const scoreRef = useRef(0);
  const roundStartRef = useRef(0);
  const finished = useRef(false);
  const roundTimer = useRef<number | undefined>(undefined);
  const flashTimer = useRef<number | undefined>(undefined);

  const clearTimers = () => {
    window.clearTimeout(roundTimer.current);
    window.clearTimeout(flashTimer.current);
  };

  const nextRound = useCallback((prevWindowMs: number, prevRound: number) => {
    clearTimers();
    const r = prevRound + 1;
    setRound(r);
    setGame(buildRound(r));
    setWindowMs(Math.max(MIN_WINDOW_MS, prevWindowMs - WINDOW_STEP_MS));
    roundStartRef.current = performance.now();
  }, []);

  const settle = useCallback(
    (delta: number, kind: "hit" | "miss") => {
      if (finished.current) return;
      scoreRef.current = Math.max(0, scoreRef.current + delta);
      setScore(scoreRef.current);
      setFlash(kind);
      flashTimer.current = window.setTimeout(() => setFlash(null), 220);
      nextRound(windowMs, round);
    },
    [nextRound, windowMs, round],
  );

  useEffect(() => {
    if (over) return;
    roundStartRef.current = performance.now();
    roundTimer.current = window.setTimeout(() => settle(-TIMEOUT_PENALTY, "miss"), windowMs);
    return () => window.clearTimeout(roundTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, over]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMsLeft((ms) => {
        const next = ms - 100;
        if (next <= 0 && !finished.current) {
          finished.current = true;
          clearTimers();
          setOver(true);
          window.setTimeout(() => onComplete(scoreRef.current), 700);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [onComplete]);

  const tap = (index: number) => {
    if (over) return;
    const reactionMs = performance.now() - roundStartRef.current;
    if (index !== game.oddIndex) {
      settle(-MISS_PENALTY, "miss");
      return;
    }
    const speed = Math.max(0, 1 - reactionMs / windowMs);
    settle(BASE_POINTS + Math.round(MAX_BONUS * speed), "hit");
  };

  const concede = () => {
    if (finished.current) return;
    finished.current = true;
    clearTimers();
    setOver(true);
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
          <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">Time left</p>
          <p className="tabular text-[1rem] font-semibold text-foreground">{(msLeft / 1000).toFixed(1)}s</p>
        </div>
      </div>

      <div className="h-1 w-full max-w-[22rem] overflow-hidden rounded-none bg-white/10">
        <div
          className="h-full bg-mint transition-[width] duration-100 linear"
          style={{ width: `${(msLeft / GAME_MS) * 100}%` }}
        />
      </div>

      {!over ? (
        <p className="text-[0.85rem] font-semibold text-foreground">Find the odd one out</p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">Time's up</p>
          <p className="tabular text-[1.05rem] font-semibold text-foreground">Final score {score}</p>
        </motion.div>
      )}

      <div
        className={`grid w-full max-w-[22rem] gap-1 rounded-none p-1 transition-colors ${
          flash === "hit" ? "bg-mint/10" : flash === "miss" ? "bg-red-500/10" : ""
        }`}
        style={{ gridTemplateColumns: `repeat(${game.side}, minmax(0, 1fr))` }}
      >
        {game.cells.map((value, i) => {
          const theme = themeFor(value);
          return (
            <button
              key={`${round}-${i}`}
              type="button"
              disabled={over}
              onClick={() => tap(i)}
              className="flex aspect-square items-center justify-center rounded-none p-1"
              style={{ background: theme.bg }}
            >
              {theme.logo && (
                <div className="flex h-[70%] w-[80%] items-center justify-center rounded-none bg-white p-0.5">
                  <img src={theme.logo} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!over && (
        <button type="button" onClick={concede} className="text-[0.7rem] text-muted underline underline-offset-2">
          Bank score &amp; end
        </button>
      )}
    </div>
  );
}
