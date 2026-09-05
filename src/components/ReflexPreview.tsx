import { useEffect, useState } from "react";
import { themeFor } from "@/lib/watchTiles";

const GRID_SIZE = 16;
const BRAND_POOL = [2, 4, 8, 16, 32, 64, 128, 256];
const ROUND_MS = 900;

function randomPoolValue() {
  return BRAND_POOL[Math.floor(Math.random() * BRAND_POOL.length)]!;
}

function buildRound() {
  const targetValue = randomPoolValue();
  const targetIndex = Math.floor(Math.random() * GRID_SIZE);
  const cells = Array.from({ length: GRID_SIZE }, () => randomPoolValue());
  cells[targetIndex] = targetValue;
  return { cells, targetValue, targetIndex };
}

/** A non-interactive, auto-looping preview of the reflex mechanic — a target brand is named, its tile briefly glows as if just tapped, then a new round appears, so a visitor can see the "find it, tap it" idea before touching anything. */
export function ReflexPreview() {
  const [round, setRound] = useState(buildRound);
  const [hit, setHit] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const hitTimer = window.setTimeout(() => {
      setHit(true);
      setScore((s) => s + 1);
    }, ROUND_MS * 0.55);
    const nextTimer = window.setTimeout(() => {
      setHit(false);
      setRound(buildRound());
    }, ROUND_MS);
    return () => {
      window.clearTimeout(hitTimer);
      window.clearTimeout(nextTimer);
    };
  }, [round]);

  return (
    <div className="rounded-none border border-white/10 bg-white/[0.05] p-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/50">Watch it play</p>
        <p className="tabular text-[0.7rem] font-semibold text-white/50">
          Score <span className="text-white">{score}</span>
        </p>
      </div>
      <p className="mt-2 text-center text-[0.7rem] font-semibold text-white">
        Tap <span className="text-mint">{themeFor(round.targetValue).brand}</span>
      </p>
      <div className="mx-auto mt-2 grid max-w-[19rem] grid-cols-4 gap-1">
        {round.cells.map((value, i) => {
          const theme = themeFor(value);
          const isTarget = i === round.targetIndex;
          return (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-none p-1 transition-transform ${
                isTarget && hit ? "scale-90 ring-2 ring-mint" : ""
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
