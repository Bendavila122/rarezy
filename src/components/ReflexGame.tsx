import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { themeFor } from "@/lib/watchTiles";

const GRID_SIZE = 16;
const BRAND_POOL = [2, 4, 8, 16, 32, 64, 128, 256];
const GAME_MS = 45_000;
const START_WINDOW_MS = 1700;
const MIN_WINDOW_MS = 550;
const WINDOW_STEP_MS = 40;
const FORBIDDEN_CHANCE = 0.3;

const HIT_BASE = 100;
const HIT_MAX_BONUS = 220;
const MISS_PENALTY = 40;
const FORBIDDEN_PENALTY = 80;
const TIMEOUT_PENALTY = 10;

type Round = { cells: number[]; targetValue: number; targetIndex: number; forbiddenIndex: number | null };

function randomPoolValue() {
  return BRAND_POOL[Math.floor(Math.random() * BRAND_POOL.length)]!;
}

function buildRound(): Round {
  const targetValue = randomPoolValue();
  const targetIndex = Math.floor(Math.random() * GRID_SIZE);
  const cells = Array.from({ length: GRID_SIZE }, () => randomPoolValue());
  cells[targetIndex] = targetValue;

  let forbiddenIndex: number | null = null;
  if (Math.random() < FORBIDDEN_CHANCE) {
    do {
      forbiddenIndex = Math.floor(Math.random() * GRID_SIZE);
    } while (forbiddenIndex === targetIndex);
  }

  return { cells, targetValue, targetIndex, forbiddenIndex };
}

function haptic(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* silent */
    }
  }
}

/**
 * Pure reflexes, not strategy: a named brand lights up the instruction line
 * and the player has to find and tap it among a grid of decoys — mostly the
 * same handful of brands repeated, so a glance isn't enough. Sometimes one
 * tile is marked forbidden and must never be tapped. Every correct tap
 * scores more the faster it lands, the reaction window shrinks round over
 * round, and the whole thing runs on a flat 45-second clock rather than
 * ending on a single mistake — a wrong tap or a miss costs points but the
 * round keeps moving immediately, so there's never a pause to think.
 */
export function ReflexGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [round, setRound] = useState<Round>(() => buildRound());
  const [roundKey, setRoundKey] = useState(0);
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

  const nextRound = useCallback((prevWindowMs: number) => {
    clearTimers();
    setRound(buildRound());
    setRoundKey((k) => k + 1);
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
      nextRound(windowMs);
    },
    [nextRound, windowMs],
  );

  // Each round has its own reaction window — expiring it without a tap is a timed-out miss.
  useEffect(() => {
    if (over) return;
    roundStartRef.current = performance.now();
    roundTimer.current = window.setTimeout(() => settle(-TIMEOUT_PENALTY, "miss"), windowMs);
    return () => window.clearTimeout(roundTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey, over]);

  // The flat 45-second game clock — independent of individual rounds.
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
    haptic(10);

    if (index === round.forbiddenIndex) {
      settle(-FORBIDDEN_PENALTY, "miss");
      return;
    }
    if (index !== round.targetIndex) {
      settle(-MISS_PENALTY, "miss");
      return;
    }
    const speed = Math.max(0, 1 - reactionMs / windowMs);
    settle(HIT_BASE + Math.round(HIT_MAX_BONUS * speed), "hit");
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
        <div className="h-full bg-mint transition-[width] duration-100 linear" style={{ width: `${(msLeft / GAME_MS) * 100}%` }} />
      </div>

      {!over ? (
        <p className="max-w-[22rem] text-center text-[0.85rem] font-semibold leading-snug text-foreground">
          Tap <span className="text-brand">{themeFor(round.targetValue).brand}</span>
          {round.forbiddenIndex !== null && (
            <span className="block text-[0.68rem] font-normal text-red-400">Avoid the red-ringed tile</span>
          )}
        </p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">Time's up</p>
          <p className="tabular text-[1.05rem] font-semibold text-foreground">Final score {score}</p>
        </motion.div>
      )}

      <div
        className={`grid w-full max-w-[22rem] grid-cols-4 gap-1.5 rounded-none p-1 transition-colors ${
          flash === "hit" ? "bg-mint/10" : flash === "miss" ? "bg-red-500/10" : ""
        }`}
      >
        {round.cells.map((value, i) => {
          const theme = themeFor(value);
          const forbidden = i === round.forbiddenIndex;
          return (
            <button
              key={`${roundKey}-${i}`}
              type="button"
              disabled={over}
              onClick={() => tap(i)}
              className={`flex aspect-square items-center justify-center rounded-none p-1.5 ${
                forbidden ? "ring-2 ring-red-500" : ""
              }`}
              style={{ background: theme.bg }}
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

      {!over && (
        <button type="button" onClick={concede} className="text-[0.7rem] text-muted underline underline-offset-2">
          Bank score &amp; end
        </button>
      )}
    </div>
  );
}
