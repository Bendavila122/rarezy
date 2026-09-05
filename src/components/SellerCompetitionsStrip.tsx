import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Sparkles, TimerReset } from "lucide-react";
import { marketDb, moneyFromPence, type MarketCompetition } from "@/lib/db";

const DAY_MS = 86_400_000;

/** Same "Ending today" / "Listed today" tags used everywhere else a listing appears. */
function TodayTags({ c }: { c: MarketCompetition }) {
  const listedToday = Date.now() - new Date(c.createdAt).getTime() < DAY_MS;
  const endingToday = c.status === "live" && new Date(c.endsAt).getTime() - Date.now() < DAY_MS;
  if (!endingToday && !listedToday) return null;

  return (
    <div className="absolute left-2 top-2 flex flex-col items-start gap-1.5">
      {endingToday && (
        <span className="flex items-center gap-1 rounded-none bg-red-500 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wide text-white">
          <TimerReset className="h-2.5 w-2.5" strokeWidth={2.4} />
          Ending today
        </span>
      )}
      {listedToday && (
        <span className="glass-dark flex items-center gap-1 rounded-none px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wide">
          <Sparkles className="h-2.5 w-2.5 text-mint" strokeWidth={2.4} />
          Listed today
        </span>
      )}
    </div>
  );
}

/**
 * Real, database-backed competitions from approved third-party sellers —
 * separate from the existing seed catalogue (`store.ts`, still
 * `localStorage`-only) until that gets migrated onto the same real data
 * layer. Renders nothing at all when there's nothing live yet, so an empty
 * marketplace doesn't leave a hole in the page.
 */
export function SellerCompetitionsStrip() {
  const [competitions, setCompetitions] = useState<MarketCompetition[]>([]);

  useEffect(() => {
    marketDb
      .fetchLiveCompetitions()
      .then(setCompetitions)
      .catch(() => setCompetitions([]));
  }, []);

  if (competitions.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-[1rem] font-semibold tracking-[-0.02em]">From verified sellers</h2>
      <p className="mt-1 text-[0.76rem] text-muted">Competitions run directly by Rarezy's approved business sellers.</p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {competitions.slice(0, 8).map((c) => {
          const pct = Math.min(100, Math.round((c.entriesSold / c.maxEntries) * 100));
          return (
            <Link key={c.id} to={`/c/${c.id}`} className="press card overflow-hidden">
              {c.product.images[0] && (
                <div className="relative aspect-square w-full overflow-hidden bg-white/[0.04]">
                  <img src={c.product.images[0].url} alt="" className="h-full w-full object-cover" />
                  <TodayTags c={c} />
                </div>
              )}
              <div className="p-3">
                <p className="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.16em] text-muted">
                  {c.seller.businessName}
                  <BadgeCheck className="h-3 w-3 text-blue-400" strokeWidth={2.2} />
                </p>
                <p className="mt-1 text-[0.85rem] tracking-tight">
                  {c.product.brand} {c.product.model}
                </p>
                <p className="tabular mt-2 text-[0.9rem] font-semibold text-brand">{moneyFromPence(c.ticketPricePence)}</p>
                <div className="mt-2 h-[3px] w-full overflow-hidden rounded-none bg-white/10">
                  <div className="h-full rounded-none bg-mint" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
