import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles } from "lucide-react";
import {
  type Direction,
  type Tile,
  SIZE,
  DIRECTIONS,
  addRandomTile,
  createInitialTiles,
  hasMoves,
  moveTiles,
} from "@/lib/game2048";
import { useElementSize } from "@/lib/useElementSize";
import { themeFor } from "@/lib/watchTiles";

const STEP_MS = 650;
const SLIDE_MS = 130;
const GAP_PX = 6;
const BOARD_PAD_PX = 6;
const TILE_TRANSITION = { type: "tween", duration: 0.14, ease: [0.22, 1, 0.36, 1] } as const;

/** Prefers a move that actually merges something — a demo that visibly combines tiles most ticks reads far better than one that just shuffles. */
function pickMove(tiles: Tile[]): Direction | null {
  const shuffled = [...DIRECTIONS].sort(() => Math.random() - 0.5);
  const candidates = shuffled.map((direction) => ({ direction, result: moveTiles(tiles, direction) }));
  const legal = candidates.filter((c) => c.result.moved);
  if (legal.length === 0) return null;
  return (legal.find((c) => c.result.gained > 0) ?? legal[0])!.direction;
}

function MiniTile({ value }: { value: number }) {
  const theme = themeFor(value);
  return (
    <div className="flex h-full w-full items-center justify-center rounded-none p-1" style={{ background: theme.bg }}>
      {theme.logo ? (
        <div className="flex h-[70%] w-[80%] items-center justify-center rounded-none bg-white p-0.5">
          <img src={theme.logo} alt="" className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <Sparkles className="h-3.5 w-3.5" style={{ color: theme.badge }} strokeWidth={2} />
      )}
    </div>
  );
}

/**
 * A non-interactive, auto-looping preview of the exact merge mechanic — the
 * same engine, brand tiles, and slide-then-merge animation as SkillGame
 * itself, playing (mildly merge-seeking) legal moves against itself so a
 * visitor can watch tiles actually slide together and merge before touching
 * anything. Standing in for an actual demo video: real product visuals,
 * always up to date, no video file to host.
 *
 * Two reliability fixes worth keeping in mind if this ever regresses:
 * (1) the tick loop reads/writes board state through a ref rather than a
 * `setTiles(prev => ...)` updater — React 18 StrictMode double-invokes
 * updater functions in development to catch impurity, and an earlier
 * version scheduled its `setTimeout` side effects inside that updater,
 * which meant every tick spawned two competing timer chains that raced and
 * intermittently wiped tiles mid-move; (2) tiles are positioned with
 * explicit pixel `x`/`y` targets (via `useElementSize`) rather than
 * framer's `layout` prop, since `layout`'s DOM-remeasurement approach can
 * lag or land mid-flight under rapid consecutive updates — explicit
 * `x`/`y` computed straight from a tile's own `r`/`c` has no such
 * measurement step. (3) a merged-away tile's exit is instant
 * (`transition: { duration: 0 }`) rather than animated — AnimatePresence
 * keeps an exiting element mounted until its own exit transition finishes,
 * so under fast repeated merges exits can be triggered faster than an
 * animated shrink-and-fade can complete, and unfinished exits pile up into
 * a visibly overpopulated, corrupted-looking board even though the
 * underlying tile state stays correct throughout. (4) a new tile never
 * fades in from `opacity: 0` — it's fully opaque from its first rendered
 * frame, only `scale` pops in, and position/scale use a short fixed-duration
 * tween rather than a spring. Under rapid successive moves a tile's
 * animation target can be reassigned (the next move) before the previous
 * one finishes; an interrupted opacity tween can be visually caught
 * partway through — a tile briefly rendering near-transparent, reading as
 * "the tile didn't show up" — and a spring's settle time isn't bounded by
 * distance the way a tween's is, so it's more likely to still be mid-flight
 * when interrupted. (5) the board's inset is baked into `posFor`/`cellSize`
 * (`BOARD_PAD_PX`) rather than a Tailwind `p-*` class on the board
 * container — an absolutely positioned element with no explicit
 * `left`/`top` inherits a static position inset by the parent's padding,
 * but explicit `left:0`/`top:0` (used here for the tiles' `x`/`y` transform
 * animation) is measured from the padding edge and isn't, so cells and
 * tiles drifted out of alignment whenever the container had padding.
 */
export function GamePreview() {
  const [boardRef, boardSize] = useElementSize<HTMLDivElement>();
  const [tiles, setTiles] = useState<Tile[]>(() => createInitialTiles());
  const [score, setScore] = useState(0);
  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;

  useEffect(() => {
    let cancelled = false;
    let timer: number;

    const reset = () => {
      const fresh = createInitialTiles();
      tilesRef.current = fresh;
      setTiles(fresh);
      setScore(0);
    };

    const tick = () => {
      const direction = pickMove(tilesRef.current);
      if (!direction) {
        reset();
        timer = window.setTimeout(tick, STEP_MS);
        return;
      }

      const result = moveTiles(tilesRef.current, direction);
      tilesRef.current = result.slid;
      setTiles(result.slid);

      timer = window.setTimeout(() => {
        if (cancelled) return;
        const next = addRandomTile(result.merged);
        const settled = hasMoves(next) ? next : createInitialTiles();
        tilesRef.current = settled;
        setTiles(settled);
        setScore((s) => (hasMoves(next) ? s + result.gained : 0));
        timer = window.setTimeout(tick, STEP_MS);
      }, SLIDE_MS);
    };

    timer = window.setTimeout(tick, STEP_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const cellSize = boardSize > 0 ? (boardSize - BOARD_PAD_PX * 2 - GAP_PX * (SIZE - 1)) / SIZE : 0;
  const posFor = (i: number) => BOARD_PAD_PX + i * (cellSize + GAP_PX);

  return (
    <div className="rounded-none border border-white/10 bg-white/[0.05] p-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/50">Watch it play</p>
        <p className="tabular text-[0.7rem] font-semibold text-white/50">
          Score <span className="text-white">{score}</span>
        </p>
      </div>
      <div ref={boardRef} className="relative mx-auto mt-2 aspect-square w-full max-w-[19rem] rounded-none bg-white/[0.04]">
        {cellSize > 0 && (
          <>
            {Array.from({ length: SIZE * SIZE }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 top-0 rounded-none bg-white/[0.08]"
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
                  <MiniTile value={t.value} />
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
