export type Direction = "left" | "right" | "up" | "down";

/** A single tile with a stable identity, so the UI can animate it sliding from its old cell to its new one. */
export type Tile = {
  id: number;
  r: number;
  c: number;
  value: number;
  /** Set on the tile born from a merge — lets the UI pop it once its two parents have slid into place. */
  mergedFrom?: [number, number];
};

export type MoveResult = {
  /** Every original tile repositioned only — values untouched, merging pairs share their target cell. Apply this first so tiles visibly slide together. */
  slid: Tile[];
  /** The final, collapsed board — merged pairs replaced by one new doubled tile. Apply after the slide settles. */
  merged: Tile[];
  moved: boolean;
  gained: number;
};

export const SIZE = 4;
export const WIN_VALUE = 2048;
export const DIRECTIONS: Direction[] = ["left", "right", "up", "down"];

let nextId = 1;
function newId(): number {
  return nextId++;
}

function toGrid(tiles: Tile[]): number[][] {
  const grid = Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));
  tiles.forEach((t) => { grid[t.r]![t.c] = t.value; });
  return grid;
}

/**
 * Slides every tile as far as it can travel in `direction`, merging equal
 * neighbours (each original tile merges at most once per move). Returns two
 * boards: `slid` (every original tile just repositioned, merging pairs
 * landing on the same target cell) for a pure sliding animation, and
 * `merged` (the real post-merge board, with fresh ids for combined tiles)
 * to apply once that slide settles — so a merge reads as two tiles sliding
 * together and combining, not one popping away and a new one appearing.
 */
export function moveTiles(tiles: Tile[], direction: Direction): MoveResult {
  const axisIsRow = direction === "left" || direction === "right";
  const descending = direction === "right" || direction === "down";

  const lines = new Map<number, Tile[]>();
  tiles.forEach((t) => {
    const key = axisIsRow ? t.r : t.c;
    const list = lines.get(key) ?? [];
    list.push(t);
    lines.set(key, list);
  });

  let gained = 0;
  const slid: Tile[] = [];
  const merged: Tile[] = [];

  for (const [fixed, line] of lines) {
    const ordered = [...line].sort((a, b) => {
      const av = axisIsRow ? a.c : a.r;
      const bv = axisIsRow ? b.c : b.r;
      return descending ? bv - av : av - bv;
    });

    let slot = 0;
    let i = 0;
    while (i < ordered.length) {
      const cur = ordered[i]!;
      const next = ordered[i + 1];
      const pos = descending ? SIZE - 1 - slot : slot;
      const r = axisIsRow ? fixed : pos;
      const c = axisIsRow ? pos : fixed;

      if (next && next.value === cur.value) {
        const value = cur.value * 2;
        gained += value;
        slid.push({ ...cur, r, c });
        slid.push({ ...next, r, c });
        merged.push({ id: newId(), value, mergedFrom: [cur.id, next.id], r, c });
        i += 2;
      } else {
        slid.push({ ...cur, r, c });
        merged.push({ ...cur, r, c });
        i += 1;
      }
      slot += 1;
    }
  }

  const moved = JSON.stringify(toGrid(merged)) !== JSON.stringify(toGrid(tiles));
  return { slid, merged, moved, gained };
}

/** Drops a new 2 (90%) or 4 (10%) tile into a random empty cell. No-op if the board is full. */
export function addRandomTile(tiles: Tile[]): Tile[] {
  const occupied = new Set(tiles.map((t) => `${t.r}-${t.c}`));
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!occupied.has(`${r}-${c}`)) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return tiles;

  const [r, c] = empty[Math.floor(Math.random() * empty.length)]!;
  return [...tiles, { id: newId(), r, c, value: Math.random() < 0.9 ? 2 : 4 }];
}

export function createInitialTiles(): Tile[] {
  return addRandomTile(addRandomTile([]));
}

/** True while at least one legal move remains (an empty cell, or two equal neighbours). */
export function hasMoves(tiles: Tile[]): boolean {
  const grid = toGrid(tiles);
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r]![c]!;
      if (v === 0) return true;
      if (c < SIZE - 1 && v === grid[r]![c + 1]) return true;
      if (r < SIZE - 1 && v === grid[r + 1]![c]) return true;
    }
  }
  return false;
}

export function hasWon(tiles: Tile[]): boolean {
  return tiles.some((t) => t.value >= WIN_VALUE);
}
