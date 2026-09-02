import { EMPTY_FILTERS, type SortId, type WatchFilters } from "./filters";

/**
 * The browse section's search/sort/filters (and where the user was scrolled to)
 * survive navigating away to an item page and back. It's plain module state —
 * not persisted to localStorage — so it lasts for this SPA session only, which
 * is exactly the "back returns you to where you were" behaviour we want: a
 * fresh visit starts clean, but Home -> a watch -> back reconstructs the same
 * filtered grid so the browser's own scroll restoration lands somewhere real.
 */
type BrowseState = {
  query: string;
  sort: SortId;
  filters: WatchFilters;
  scrollY: number;
};

let state: BrowseState = {
  query: "",
  sort: "ending",
  filters: EMPTY_FILTERS,
  scrollY: 0,
};

export const browseState = {
  get: () => state,
  set: (next: Partial<BrowseState>) => {
    state = { ...state, ...next };
  },
};
