import { useEffect, useRef, useState } from "react";
import {
  type Direction,
  type Tile,
  DIRECTIONS,
  addRandomTile,
  createInitialTiles,
  hasMoves,
  moveTiles,
} from "./game2048";

const STEP_MS = 650;
const SLIDE_MS = 130;

/** Prefers a move that actually merges something — a demo that visibly combines tiles most ticks reads far better than one that just shuffles. */
function pickMove(tiles: Tile[]): Direction | null {
  const shuffled = [...DIRECTIONS].sort(() => Math.random() - 0.5);
  const candidates = shuffled.map((direction) => ({ direction, result: moveTiles(tiles, direction) }));
  const legal = candidates.filter((c) => c.result.moved);
  if (legal.length === 0) return null;
  return (legal.find((c) => c.result.gained > 0) ?? legal[0])!.direction;
}

/**
 * Runs the real Rarezy Merge engine against itself (mildly merge-seeking
 * legal moves, same rules a real player plays under) so any UI that wants
 * to show genuine live gameplay — not a staged screenshot — can just read
 * `tiles`/`score` off this hook. Shared by the Home page's game preview and
 * the buyers scroll-story phone screen, so both show the identical real
 * engine rather than two hand-crafted approximations of it.
 *
 * See `GamePreview`'s original docstring for the reliability reasoning
 * behind reading/writing board state through a ref rather than a `setTiles`
 * updater, and positioning tiles with explicit `x`/`y` rather than framer's
 * `layout` prop — both still apply here since this drives the same kind of
 * rapid, timer-driven consecutive updates.
 */
export function useMergeSim() {
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

  return { tiles, score };
}
