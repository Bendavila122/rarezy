import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { categoryOf, CONDITIONS, money, titleOf, type ItemCategory } from "@/lib/marketplace";
import { useTypewriterCycle } from "@/lib/useTypewriterCycle";
import { useRarezy, type CompetitionListing } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORY_LABELS, FilterDrawer } from "@/components/FilterDrawer";
import { activeFilterCount, EMPTY_FILTERS, matchesFilters, SORTERS, SORTS, type SortId, type WatchFilters } from "@/lib/filters";
import { browseState } from "@/lib/browseState";
import { Reveal } from "@/components/Reveal";

type Chip = { key: string; label: string; remove: () => void };

/**
 * Search, filters and the full competition grid — rendered by the
 * standalone `/browse` page. Every category is shown here; narrow to one
 * via the Category filter (the first section in the filter drawer).
 * Search/sort/filters seed from (and save back to) `browseState`, so
 * going to an item and back reconstructs the exact same filtered grid.
 */
export function BrowseSection() {
  const { records } = useRarezy();
  const [query, setQuery] = useState(() => browseState.get().query);
  const [sort, setSort] = useState<SortId>(() => browseState.get().sort);
  const [filters, setFilters] = useState<WatchFilters>(() => browseState.get().filters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    browseState.set({ query, sort, filters });
  }, [query, sort, filters]);

  const live = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && r.status === "live",
  );

  const countOf = (category: ItemCategory) => live.filter((r) => categoryOf(r.item) === category).length;
  // Every count here is real, live stock — filtered out entirely if a
  // category happens to have nothing live, rather than ever showing "0".
  const placeholderPhrases = [
    { count: countOf("watch"), text: (n: number) => `Search from ${n} watch${n === 1 ? "" : "es"}` },
    { count: countOf("electronics"), text: (n: number) => `Search from ${n} electronics` },
    { count: countOf("cash"), text: (n: number) => `Search from ${n} cash prize${n === 1 ? "" : "s"}` },
    { count: countOf("handbag"), text: (n: number) => `Search from ${n} handbag${n === 1 ? "" : "s"}` },
    { count: countOf("clothing"), text: (n: number) => `Search from ${n} clothing item${n === 1 ? "" : "s"}` },
    { count: countOf("jewellery"), text: (n: number) => `Search from ${n} jewellery item${n === 1 ? "" : "s"}` },
    { count: countOf("car"), text: (n: number) => `Search from ${n} car${n === 1 ? "" : "s"}` },
  ]
    .filter((p) => p.count > 0)
    .map((p) => p.text(p.count));
  const typedPlaceholder = useTypewriterCycle(placeholderPhrases);

  const filteredForCount = useMemo(() => live.filter((c) => matchesFilters(c, filters)), [live, filters]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return filteredForCount
      .filter((r) => {
        if (!q) return true;
        const haystack = `${titleOf(r.item)} ${r.item.description ?? ""}`.toLowerCase();
        return haystack.includes(q);
      })
      .sort(SORTERS[sort]);
  }, [filteredForCount, query, sort]);

  const activeCount = activeFilterCount(filters);

  const chips: Chip[] = [
    ...filters.categories.map((c) => ({
      key: `cat-${c}`,
      label: CATEGORY_LABELS[c] ?? c,
      remove: () => setFilters((f) => ({ ...f, categories: f.categories.filter((v) => v !== c) })),
    })),
    ...filters.brands.map((b) => ({
      key: `brand-${b}`,
      label: b,
      remove: () => setFilters((f) => ({ ...f, brands: f.brands.filter((v) => v !== b) })),
    })),
    ...filters.conditions.map((c) => ({
      key: `cond-${c}`,
      label: CONDITIONS.find((x) => x.id === c)?.label ?? c,
      remove: () => setFilters((f) => ({ ...f, conditions: f.conditions.filter((v) => v !== c) })),
    })),
    ...filters.movements.map((m) => ({
      key: `mv-${m}`,
      label: m,
      remove: () => setFilters((f) => ({ ...f, movements: f.movements.filter((v) => v !== m) })),
    })),
    ...filters.caseMaterials.map((m) => ({
      key: `case-${m}`,
      label: m,
      remove: () => setFilters((f) => ({ ...f, caseMaterials: f.caseMaterials.filter((v) => v !== m) })),
    })),
    ...filters.braceletMaterials.map((m) => ({
      key: `bracelet-${m}`,
      label: m,
      remove: () => setFilters((f) => ({ ...f, braceletMaterials: f.braceletMaterials.filter((v) => v !== m) })),
    })),
    ...filters.dialColors.map((m) => ({
      key: `dial-${m}`,
      label: m,
      remove: () => setFilters((f) => ({ ...f, dialColors: f.dialColors.filter((v) => v !== m) })),
    })),
    ...(filters.priceMin || filters.priceMax
      ? [
          {
            key: "price",
            label: `Ticket ${filters.priceMin ? money(Number(filters.priceMin)) : "£0"}–${
              filters.priceMax ? money(Number(filters.priceMax)) : "any"
            }`,
            remove: () => setFilters((f) => ({ ...f, priceMin: "", priceMax: "" })),
          },
        ]
      : []),
    ...(filters.valueMin || filters.valueMax
      ? [
          {
            key: "value",
            label: `Value ${filters.valueMin ? money(Number(filters.valueMin)) : "£0"}–${
              filters.valueMax ? money(Number(filters.valueMax)) : "any"
            }`,
            remove: () => setFilters((f) => ({ ...f, valueMin: "", valueMax: "" })),
          },
        ]
      : []),
    ...(filters.yearMin || filters.yearMax
      ? [
          {
            key: "year",
            label: `${filters.yearMin || "Any"}–${filters.yearMax || "Any"}`,
            remove: () => setFilters((f) => ({ ...f, yearMin: "", yearMax: "" })),
          },
        ]
      : []),
    ...(filters.diameterMin || filters.diameterMax
      ? [
          {
            key: "diameter",
            label: `${filters.diameterMin || "Any"}–${filters.diameterMax || "Any"} mm`,
            remove: () => setFilters((f) => ({ ...f, diameterMin: "", diameterMax: "" })),
          },
        ]
      : []),
    ...(filters.fullSetOnly
      ? [{ key: "fullset", label: "Box & papers", remove: () => setFilters((f) => ({ ...f, fullSetOnly: false })) }]
      : []),
    ...(filters.endingSoon
      ? [{ key: "ending", label: "Ending within 48h", remove: () => setFilters((f) => ({ ...f, endingSoon: false })) }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 pb-6 pt-10">
      <Reveal amount={0.5}>
        <h1 className="text-[1.4rem] font-semibold tracking-[-0.02em]">All competitions</h1>
        <p className="mt-1 text-[0.78rem] text-muted">
          {shown.length} competition{shown.length === 1 ? "" : "s"} live now
        </p>
      </Reveal>

      <div className="glass-dark relative mt-5 flex h-12 items-center rounded-full">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search competitions"
          className="w-full rounded-full border-none bg-transparent py-3 pl-11 pr-4 text-[16px] tracking-tight text-white outline-none"
        />
        {query.length === 0 && (
          <span className="pointer-events-none absolute left-11 top-1/2 flex -translate-y-1/2 items-center overflow-hidden text-[0.9rem] tracking-tight text-white/40">
            {typedPlaceholder}
            <span className="ml-0.5 animate-pulse">▌</span>
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={`press flex items-center gap-1.5 rounded-none px-4 py-2.5 text-[0.8rem] font-medium tracking-tight ${
            activeCount > 0 ? "bg-brand text-background" : "bg-white/[0.06] text-foreground"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2.2} />
          Filters
          {activeCount > 0 && (
            <span className="tabular flex h-4 min-w-4 items-center justify-center rounded-none bg-background/90 px-1 text-[0.62rem] font-semibold text-brand">
              {activeCount}
            </span>
          )}
        </button>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortId)}
          className="rounded-none bg-white/[0.06] px-3 py-2.5 text-[0.76rem] tracking-tight text-foreground outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.remove}
              className="press flex items-center gap-1 rounded-none bg-brand/10 py-1.5 pl-3 pr-2 text-[0.72rem] font-medium tracking-tight text-brand-dim"
            >
              {chip.label}
              <X className="h-3 w-3" strokeWidth={2.4} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="press px-2 text-[0.72rem] text-muted underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="mt-14 text-center text-[0.9rem] text-muted">No watches match your filters.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: Math.min(i % 8, 8) * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <ListingCard listing={c} />
            </motion.div>
          ))}
        </div>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        filters={filters}
        onChange={setFilters}
        listings={live}
        resultCount={filteredForCount.length}
      />
    </div>
  );
}
