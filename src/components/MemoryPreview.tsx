import { useEffect, useState } from "react";
import { themeFor } from "@/lib/watchTiles";

const GRID_SIZE = 9;
const BRAND_POOL = [2, 4, 8, 16, 32, 64, 128, 256, 512];
const REVEAL_MS = 500;
const GAP_MS = 160;

function shuffledIndices(n: number) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** A non-interactive, auto-looping preview of the memory mechanic — a sequence lights up, then the board dims until the next one starts, growing by one step each loop, so a visitor can see the "watch it, then repeat it" idea before touching anything. */
export function MemoryPreview() {
  const [cellValues] = useState(() =>
    Array.from({ length: GRID_SIZE }, () => BRAND_POOL[Math.floor(Math.random() * BRAND_POOL.length)]!),
  );
  const [length, setLength] = useState(3);
  const [litIndex, setLitIndex] = useState<number | null>(null);
  const [showing, setShowing] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const sequence = shuffledIndices(GRID_SIZE).slice(0, length);
    const timers: number[] = [];
    setShowing(true);
    sequence.forEach((idx, i) => {
      timers.push(window.setTimeout(() => setLitIndex(idx), i * (REVEAL_MS + GAP_MS)));
      timers.push(window.setTimeout(() => setLitIndex(null), i * (REVEAL_MS + GAP_MS) + REVEAL_MS));
    });
    timers.push(
      window.setTimeout(
        () => {
          setShowing(false);
          setScore((s) => s + 1);
        },
        sequence.length * (REVEAL_MS + GAP_MS) + 100,
      ),
    );
    timers.push(
      window.setTimeout(
        () => setLength((l) => (l >= GRID_SIZE ? 3 : l + 1)),
        sequence.length * (REVEAL_MS + GAP_MS) + 700,
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [length]);

  return (
    <div className="rounded-none border border-white/10 bg-white/[0.05] p-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/50">Watch it play</p>
        <p className="tabular text-[0.7rem] font-semibold text-white/50">
          Score <span className="text-white">{score}</span>
        </p>
      </div>
      <div className="mx-auto mt-2 grid max-w-[14rem] grid-cols-3 gap-1.5">
        {cellValues.map((value, i) => {
          const theme = themeFor(value);
          return (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-none p-1 transition-all ${
                litIndex === i ? "scale-105 ring-2 ring-mint" : ""
              }`}
              style={{ background: theme.bg, opacity: showing ? 1 : 0.55 }}
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
