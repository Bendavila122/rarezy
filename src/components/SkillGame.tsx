import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  type Direction,
  type Tile,
  SIZE,
  addRandomTile,
  createInitialTiles,
  hasMoves,
  hasWon,
  moveTiles,
} from "@/lib/game2048";
import { useElementSize } from "@/lib/useElementSize";
import { themeFor } from "@/lib/watchTiles";

function haptic(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* silent */
    }
  }
}

const SWIPE_THRESHOLD = 28;
const SLIDE_MS = 130;
const GAP_PX = 8;
const BOARD_PAD_PX = 8;
const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
};
const TILE_TRANSITION = { type: "tween", duration: 0.14, ease: [0.22, 1, 0.36, 1] } as const;

function TileFace({ value }: { value: number }) {
  const theme = themeFor(value);
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-none p-1.5 shadow-sm"
      style={{ background: theme.bg }}
    >
      <span className="tabular self-start text-[0.55rem] font-bold tracking-tight" style={{ color: theme.badge }}>
        {value}
      </span>
      {theme.logo ? (
        <div className="-mt-1.5 flex h-[62%] w-[78%] items-center justify-center rounded-none bg-white p-1.5 shadow">
          <img src={theme.logo} alt={theme.brand} className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <Sparkles className="-mt-1.5 h-6 w-6" style={{ color: theme.badge }} strokeWidth={1.8} />
      )}
    </div>
  );
}

/**
 * The skill element behind every listing entry: swipe (or use arrow keys) to
 * slide and merge watch brands up the ladder — a 2 or 4
 * tile drops after every move, weighted 90/10. Only one attempt reaches the
 * top of a listing's leaderboard, so this has to be reliable under fast,
 * repeated input, not just under a slow careful test.
 *
 * Tiles are positioned with explicit pixel `x`/`y` animation (measured via
 * `useElementSize`, translated with `animate={{ x, y }}`) rather than
 * framer's `layout` prop. `layout` re-measures the DOM to figure out where
 * an element moved from — reliable for occasional changes, but under rapid
 * consecutive state updates (fast swiping) that measurement can lag behind
 * or land mid-flight, which read as tiles briefly failing to render.
 * Explicit `x`/`y` targets computed straight from the tile's own `r`/`c`
 * have no such measurement step: motion always knows exactly where a tile
 * should be, however fast the input arrives.
 *
 * Every move plays in two phases: tiles slide to their new cell first
 * (merging pairs converge on the same cell), then — once that settles —
 * merged pairs collapse into their doubled tile and the new random tile
 * drops. An `animating` ref blocks new input until a move's two phases
 * finish, so rapid input can't interleave two moves' state. Pending timers
 * are tracked and cleared on unmount so a move animating when the player
 * navigates away can't fire a stray `onComplete` (and so a stray
 * `recordScore`) afterwards.
 *
 * A merged-away tile's exit is instant (`transition: { duration: 0 }`), not
 * animated. AnimatePresence keeps an exiting element mounted until its own
 * exit transition finishes; under fast repeated merges (well within reach
 * of normal quick swiping) exits can be triggered faster than an animated
 * shrink-and-fade can complete, so unfinished exiting tiles pile up and the
 * board visibly fills with stale, overlapping tiles even though the
 * underlying `tiles` state is always correct. An instant exit can never
 * outlive the move that triggered it, so it can never pile up.
 *
 * A new tile never fades in from `opacity: 0` — it's fully opaque from its
 * very first rendered frame, only its `scale` pops in. Under rapid
 * successive moves a tile can be reassigned a new animation target (the
 * next move) before its previous one finishes; an interrupted opacity tween
 * can be visually caught partway through, i.e. a tile briefly rendering
 * near-transparent, which reads as "the tile didn't show up". Position and
 * scale use a short, fixed-duration tween rather than a spring for the same
 * reason: a spring's settle time isn't bounded by distance the way a tween's
 * is, so it's more likely to still be mid-flight when the next move
 * interrupts it.
 *
 * The board's inset is baked into `posFor`/`cellSize` (`BOARD_PAD_PX`)
 * rather than a Tailwind `p-*` class on the board container. The background
 * cells (no explicit `left`/`top`, positioned via `transform` alone from
 * their default static position) and the tiles (explicit `left-0 top-0`,
 * needed for framer's `x`/`y` transform animation) don't resolve their
 * "zero" position the same way when the container has padding — an
 * absolutely positioned element's static position is inset by the parent's
 * padding, but explicit `left:0`/`top:0` is measured from the padding edge
 * and isn't. With padding on the container, tiles rendered a few pixels off
 * from the background grid instead of filling their cell, reading as "tiles
 * aren't on their own square." Giving both an identical explicit
 * `left-0 top-0` and computing the inset directly in `posFor` keeps them on
 * one shared coordinate system regardless of container padding.
 */
export function SkillGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [boardRef, boardSize] = useElementSize<HTMLDivElement>();
  const [tiles, setTiles] = useState<Tile[]>(() => createInitialTiles());
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [wonAcknowledged, setWonAcknowledged] = useState(false);
  const [over, setOver] = useState(false);

  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const wonRef = useRef(won);
  wonRef.current = won;

  const finished = useRef(false);
  const animating = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const pendingTimers = useRef<number[]>([]);

  useEffect(
    () => () => {
      pendingTimers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      pendingTimers.current = pendingTimers.current.filter((t) => t !== id);
      fn();
    }, delay);
    pendingTimers.current.push(id);
  }, []);

  const applyMove = useCallback((direction: Direction) => {
    if (finished.current || animating.current) return;
    const result = moveTiles(tilesRef.current, direction);
    if (!result.moved) return;

    haptic(10);
    animating.current = true;
    tilesRef.current = result.slid;
    setTiles(result.slid);

    schedule(() => {
      const next = addRandomTile(result.merged);
      const nextScore = scoreRef.current + result.gained;
      tilesRef.current = next;
      scoreRef.current = nextScore;
      setTiles(next);
      setScore(nextScore);
      animating.current = false;
      if (!wonRef.current && hasWon(next)) {
        wonRef.current = true;
        setWon(true);
      }

      if (!hasMoves(next)) {
        finished.current = true;
        setOver(true);
        schedule(() => onComplete(nextScore), 900);
      }
    }, SLIDE_MS);
  }, [onComplete, schedule]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[e.key];
      if (!direction) return;
      e.preventDefault();
      applyMove(direction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyMove]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    const t = e.changedTouches[0];
    if (!start || !t) return;

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;

    if (Math.abs(dx) > Math.abs(dy)) applyMove(dx > 0 ? "right" : "left");
    else applyMove(dy > 0 ? "down" : "up");
  };

  const concede = () => {
    if (finished.current || animating.current) return;
    finished.current = true;
    setOver(true);
    schedule(() => onComplete(scoreRef.current), 700);
  };

  const cellSize = boardSize > 0 ? (boardSize - BOARD_PAD_PX * 2 - GAP_PX * (SIZE - 1)) / SIZE : 0;
  const posFor = (i: number) => BOARD_PAD_PX + i * (cellSize + GAP_PX);

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex w-full max-w-[22rem] items-end justify-between">
        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.28em] text-muted">Score</p>
          <p className="tabular text-[1.6rem] font-bold leading-none tracking-[-0.02em] text-foreground">{score}</p>
        </div>
        {!over && (
          <button
            type="button"
            onClick={concede}
            className="text-[0.7rem] text-muted underline underline-offset-2"
          >
            Bank score &amp; end
          </button>
        )}
      </div>

      <p className="max-w-[22rem] text-center text-[0.7rem] leading-snug text-muted">
        Swipe, or use arrow keys — merge matching brands to climb the ladder.
      </p>

      <AnimatePresence>
        {won && !wonAcknowledged && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="w-full max-w-[22rem] rounded-none bg-brand/10 px-3 py-2 text-center"
          >
            <p className="text-[0.78rem] font-medium text-brand">
              You reached Patek Philippe — the top tier. Keep merging for a legendary finish.
            </p>
            <button
              type="button"
              onClick={() => setWonAcknowledged(true)}
              className="mt-1 text-[0.68rem] text-muted underline underline-offset-2"
            >
              Keep playing
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={boardRef}
        className="relative aspect-square w-full max-w-[22rem] touch-none select-none rounded-none bg-white/[0.06]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
      >
        {cellSize > 0 && (
          <>
            {Array.from({ length: SIZE * SIZE }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 top-0 rounded-none bg-white/[0.05]"
                style={{
                  width: cellSize,
                  height: cellSize,
                  transform: `translate(${posFor(i % SIZE)}px, ${posFor(Math.floor(i / SIZE))}px)`,
                }}
              />
            ))}

            <AnimatePresence>
              {tiles.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ x: posFor(t.c), y: posFor(t.r), scale: 0.5 }}
                  animate={{ x: posFor(t.c), y: posFor(t.r), scale: 1 }}
                  exit={{ transition: { duration: 0 } }}
                  transition={TILE_TRANSITION}
                  className="absolute left-0 top-0"
                  style={{ width: cellSize, height: cellSize }}
                >
                  <TileFace value={t.value} />
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      {over && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">No merges left</p>
          <p className="tabular text-[1.05rem] font-semibold text-foreground">Final score {score}</p>
        </motion.div>
      )}
    </div>
  );
}
