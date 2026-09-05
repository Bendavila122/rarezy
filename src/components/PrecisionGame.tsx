import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const GAME_MS = 60_000;
const START_SPEED = 100;
const SPEED_STEP = 5;
const START_ZONE_DEG = 28;
const MIN_ZONE_DEG = 9;
const ZONE_STEP = 1.1;
const MAX_STREAK_MULT = 2.2;

type Tier = { label: string; points: number; tone: string };

function tierFor(diffDeg: number, zoneDeg: number): Tier {
  const half = zoneDeg / 2;
  if (diffDeg <= half * 0.25) return { label: "Perfect", points: 1000, tone: "text-mint" };
  if (diffDeg <= half * 0.55) return { label: "Excellent", points: 750, tone: "text-mint" };
  if (diffDeg <= half) return { label: "Good", points: 500, tone: "text-amber-300" };
  if (diffDeg <= half * 2) return { label: "Poor", points: 100, tone: "text-amber-300" };
  return { label: "Miss", points: 0, tone: "text-red-400" };
}

function angularDiff(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function norm(a: number) {
  return ((a % 360) + 360) % 360;
}

/**
 * Stop the Watch: a hand sweeps continuously around the dial and the
 * player has to stop it inside a shrinking target zone. Reaction time
 * barely matters here compared to the other games — the challenge is
 * continuous motion, so there's no single frame worth screenshotting: by
 * the time anything could react to a still image, the hand has moved on.
 *
 * The hand's rotation is written straight to the DOM via a ref inside a
 * `requestAnimationFrame` loop rather than React state, so the sweep can
 * update every frame without forcing 60 renders/sec — only score, round
 * number and the 100ms countdown actually go through `setState`. The hand
 * element itself carries no Tailwind transform utility (no `-translate-*`),
 * specifically so writing `style.transform` directly from the rAF loop
 * can't clobber a class-based transform the way it would if the two were
 * mixed on the same element.
 */
export function PrecisionGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => Math.random() * 360);
  const [zoneDeg, setZoneDeg] = useState(START_ZONE_DEG);
  const [msLeft, setMsLeft] = useState(GAME_MS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<Tier | null>(null);
  const [over, setOver] = useState(false);

  const handRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(Math.random() * 360);
  const speedRef = useRef(START_SPEED);
  const directionRef = useRef<1 | -1>(1);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const finished = useRef(false);
  const rafRef = useRef<number | undefined>(undefined);
  const lastTsRef = useRef<number | undefined>(undefined);
  const flashTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTsRef.current === undefined) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      angleRef.current = norm(angleRef.current + directionRef.current * speedRef.current * dt);
      if (handRef.current) handRef.current.style.transform = `rotate(${angleRef.current}deg)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (over) return;
    const id = window.setInterval(() => {
      setMsLeft((ms) => {
        const next = ms - 100;
        if (next <= 0 && !finished.current) {
          finished.current = true;
          setOver(true);
          window.setTimeout(() => onComplete(scoreRef.current), 700);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [onComplete, over]);

  const stop = useCallback(() => {
    if (over) return;
    const diff = angularDiff(angleRef.current, target);
    const tier = tierFor(diff, zoneDeg);
    const mult = tier.points > 0 ? Math.min(MAX_STREAK_MULT, 1 + streakRef.current * 0.15) : 1;
    const gained = Math.round(tier.points * mult);
    scoreRef.current += gained;
    setScore(scoreRef.current);
    streakRef.current = tier.points > 0 ? streakRef.current + 1 : 0;
    setStreak(streakRef.current);
    setFlash(tier);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 500);

    const nextRound = round + 1;
    setRound(nextRound);
    setZoneDeg(Math.max(MIN_ZONE_DEG, START_ZONE_DEG - nextRound * ZONE_STEP));
    setTarget(Math.random() * 360);
    speedRef.current = START_SPEED + nextRound * SPEED_STEP + Math.random() * 20;
    if (Math.random() < 0.12 + nextRound * 0.01) directionRef.current = directionRef.current === 1 ? -1 : 1;
  }, [over, round, target, zoneDeg]);

  const concede = () => {
    if (finished.current) return;
    finished.current = true;
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
        <div className="text-center">
          <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">Streak</p>
          <p className="tabular text-[1rem] font-semibold text-foreground">
            ×{Math.min(MAX_STREAK_MULT, 1 + streak * 0.15).toFixed(1)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">Time left</p>
          <p className="tabular text-[1rem] font-semibold text-foreground">{(msLeft / 1000).toFixed(1)}s</p>
        </div>
      </div>

      {!over ? (
        <p className="text-[0.78rem] text-muted">Stop the hand inside the mint zone</p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">Time's up</p>
          <p className="tabular text-[1.05rem] font-semibold text-foreground">Final score {score}</p>
        </motion.div>
      )}

      <div className="relative h-56 w-56 rounded-full border border-white/10 bg-white/[0.04]">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from ${target - zoneDeg / 2}deg, oklch(0.82 0.19 148 / 35%) 0deg, oklch(0.82 0.19 148 / 35%) ${zoneDeg}deg, transparent ${zoneDeg}deg)`,
          }}
        />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 30}deg)` }}>
            <div className="absolute left-1/2 top-1 h-2 w-[2px] -translate-x-1/2 bg-white/25" />
          </div>
        ))}
        <div
          ref={handRef}
          className="absolute left-1/2 bottom-1/2 h-[42%] w-[3px] rounded-full bg-mint"
          style={{ marginLeft: "-1.5px", transformOrigin: "50% 100%" }}
        />
        <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint" />

        {flash && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute inset-0 flex items-center justify-center text-[1rem] font-bold ${flash.tone}`}
          >
            {flash.label}
          </motion.p>
        )}
      </div>

      {!over && (
        <button
          type="button"
          onClick={stop}
          className="brand-glow press w-full max-w-[16rem] rounded-none bg-mint py-3 text-center text-[0.9rem] font-bold text-brand-deep"
        >
          STOP
        </button>
      )}

      {!over && (
        <button type="button" onClick={concede} className="text-[0.7rem] text-muted underline underline-offset-2">
          Bank score &amp; end
        </button>
      )}
    </div>
  );
}
