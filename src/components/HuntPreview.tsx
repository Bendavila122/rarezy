import { useEffect, useState } from "react";
import { themeFor } from "@/lib/watchTiles";

const SIDE = 5;
const ROUND_MS = 900;
const BRAND_POOL = [2, 4, 8, 16, 32, 64, 128, 256, 512];

function pickTwoDistinct() {
  const a = BRAND_POOL[Math.floor(Math.random() * BRAND_POOL.length)]!;
  let b = BRAND_POOL[Math.floor(Math.random() * BRAND_POOL.length)]!;
  while (b === a) b = BRAND_POOL[Math.floor(Math.random() * BRAND_POOL.length)]!;
  return [a, b] as const;
}

function buildRound() {
  const cellCount = SIDE * SIDE;
  const [baseValue, oddValue] = pickTwoDistinct();
  const oddIndex = Math.floor(Math.random() * cellCount);
  const cells = Array.from({ length: cellCount }, () => baseValue);
  cells[oddIndex] = oddValue;
  return { cells, oddIndex };
}

/** A non-interactive, auto-looping preview of the hunt mechanic — the odd tile briefly glows as if just found, then a new board appears, so a visitor can see the "spot the different one" idea before touching anything. */
export function HuntPreview() {
  const [game, setGame] = useState(buildRound);
  const [hit, setHit] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const hitTimer = window.setTimeout(() => {
      setHit(true);
      setScore((s) => s + 1);
    }, ROUND_MS * 0.6);
    const nextTimer = window.setTimeout(() => {
      setHit(false);
      setGame(buildRound());
    }, ROUND_MS);
    return () => {
      window.clearTimeout(hitTimer);
      window.clearTimeout(nextTimer);
    };
  }, [game]);

  return (
    <div className="rounded-none border border-white/10 bg-white/[0.05] p-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/50">Watch it play</p>
        <p className="tabular text-[0.7rem] font-semibold text-white/50">
          Score <span className="text-white">{score}</span>
        </p>
      </div>
      <p className="mt-2 text-center text-[0.7rem] font-semibold text-white">Find the odd one out</p>
      <div
        className="mx-auto mt-2 grid max-w-[14rem] gap-1"
        style={{ gridTemplateColumns: `repeat(${SIDE}, minmax(0, 1fr))` }}
      >
        {game.cells.map((value, i) => {
          const theme = themeFor(value);
          const isOdd = i === game.oddIndex;
          return (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-none p-0.5 transition-transform ${
                isOdd && hit ? "scale-90 ring-2 ring-mint" : ""
              }`}
              style={{ background: theme.bg }}
            >
              {theme.logo && (
                <div className="flex h-[70%] w-[80%] items-center justify-center rounded-none bg-white p-0.5">
                  <img src={theme.logo} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
