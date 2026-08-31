import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { CATEGORIES, glyphOf, money, titleOf, type ItemCategory } from "@/lib/marketplace";
import { useMore4Me, type CompetitionListing } from "@/lib/store";

function daysLeft(deadlineAt: string) {
  const ms = new Date(deadlineAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function Browse() {
  const { records } = useMore4Me();
  const [filter, setFilter] = useState<ItemCategory | "all">("all");

  const live = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && r.status === "live",
  );
  const shown = filter === "all" ? live : live.filter((r) => r.item.category === filter);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">Live competitions</h1>
      <p className="mt-2 text-[0.85rem] text-muted">
        Entries sold and days left are visible. The minimum a seller will accept isn't — that's
        between them and More4Me.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
            {c.glyph} {c.label}
          </FilterChip>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-[0.9rem] text-muted">Nothing live in this category right now.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {shown.map((c, i) => {
            const raised = c.entriesSold * c.entryFee;
            const pct = Math.min(100, (raised / c.targetMax) * 100);
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/item/${c.id}`} className="card block p-6 transition-transform active:scale-[0.98]">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">
                      {glyphOf(c.item.category)} {c.item.brand}
                    </p>
                    <span className="tabular shrink-0 text-[0.68rem] uppercase tracking-[0.2em] text-muted">
                      {daysLeft(c.deadlineAt)}d left
                    </span>
                  </div>
                  <p className="mt-3 text-[1.1rem] tracking-tight">{titleOf(c.item)}</p>
                  <p className="mt-2 text-[0.78rem] text-muted">Entries from {money(c.entryFee)}</p>
                  <div className="mt-5 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-gold"
                    />
                  </div>
                  <p className="tabular mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-muted">
                    {c.entriesSold.toLocaleString("en-GB")} entries sold
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[0.78rem] tracking-tight transition-all active:scale-[0.97] ${
        active ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/4 text-muted"
      }`}
    >
      {children}
    </button>
  );
}
