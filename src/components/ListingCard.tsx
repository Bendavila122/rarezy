import { Link } from "react-router-dom";
import { BadgeCheck, ShoppingBag, Sparkles, TimerReset } from "lucide-react";
import { money, titleOf } from "@/lib/marketplace";
import { rarezy, useRarezy, type CompetitionListing } from "@/lib/store";
import { authGate } from "@/lib/authGate";
import { browseState } from "@/lib/browseState";
import { TiltCard } from "@/components/TiltCard";
import { dealerById } from "@/lib/dealers";

const DAY_MS = 86_400_000;

/** Small "Ending today" / "Listed today" tags shared by both card sizes. */
function TodayTags({ listing: c }: { listing: CompetitionListing }) {
  const listedToday = Date.now() - new Date(c.createdAt).getTime() < DAY_MS;
  const endingToday = c.status === "live" && new Date(c.deadlineAt).getTime() - Date.now() < DAY_MS;
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

/** The seller-name-plus-verified-badge label line, matching the "From verified sellers" strip's card style everywhere a listing shows up. */
function SellerLine({ listing: c }: { listing: CompetitionListing }) {
  const dealer = dealerById(c.dealerId);
  return (
    <p className="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.16em] text-muted">
      {dealer ? dealer.name : "Rarezy"}
      {dealer && <BadgeCheck className="h-3 w-3 shrink-0 text-blue-400" strokeWidth={2.2} />}
    </p>
  );
}

/**
 * The card style used site-wide now: seller name + verified badge, title,
 * price, a raised-so-far progress bar — the same layout as the "From
 * verified sellers" strip, rather than a different design per section. No
 * watchlist/save button; buying is a single small basket icon instead of a
 * full-width bar.
 */
export function ListingCard({ listing: c }: { listing: CompetitionListing }) {
  const { currentUser } = useRarezy();
  const pct = c.entriesTotal > 0 ? Math.min(100, Math.round((c.entriesSold / c.entriesTotal) * 100)) : 0;

  return (
    <TiltCard max={8} className="h-full">
      <div className="card group relative h-full overflow-hidden">
        <Link
          to={`/item/${c.id}`}
          className="press block"
          onClick={() => browseState.set({ scrollY: window.scrollY })}
        >
          {c.item.photos?.[0] && (
            <div className="relative aspect-square w-full overflow-hidden bg-white/[0.04]">
              <img
                src={c.item.photos[0]}
                alt={titleOf(c.item)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <TodayTags listing={c} />
            </div>
          )}
          <div className="p-4">
            <SellerLine listing={c} />
            <p className="mt-1.5 text-[0.92rem] leading-snug tracking-tight">{titleOf(c.item)}</p>
            <p className="tabular mt-2 text-[0.9rem] font-semibold text-brand">{money(c.entryFee)}</p>
            <div className="mt-2 h-[3px] w-full overflow-hidden rounded-none bg-white/10">
              <div className="h-full rounded-none bg-mint" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (!currentUser) {
              authGate.request("Create a free account to buy a ticket.");
              return;
            }
            rarezy.addToBasket(c.id, 1);
          }}
          aria-label="Add to basket"
          className="press absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand shadow-lg shadow-black/30"
        >
          <ShoppingBag className="h-4 w-4 text-background" strokeWidth={2.1} />
        </button>
      </div>
    </TiltCard>
  );
}

/** Narrow, fixed-width card for horizontal-scroll rows (App Store "carousel" style). */
export function ListingCardCompact({ listing: c }: { listing: CompetitionListing }) {
  const pct = c.entriesTotal > 0 ? Math.min(100, Math.round((c.entriesSold / c.entriesTotal) * 100)) : 0;
  return (
    <Link to={`/item/${c.id}`} className="card press block w-40 shrink-0 overflow-hidden">
      {c.item.photos?.[0] && (
        <div className="relative aspect-square w-full overflow-hidden bg-white/[0.04]">
          <img src={c.item.photos[0]} alt={titleOf(c.item)} className="h-full w-full object-cover" />
          <TodayTags listing={c} />
        </div>
      )}
      <div className="p-3">
        <SellerLine listing={c} />
        <p className="mt-1 truncate text-[0.8rem] tracking-tight">{titleOf(c.item)}</p>
        <p className="tabular mt-1.5 text-[0.8rem] font-semibold text-brand">{money(c.entryFee)}</p>
        <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-none bg-white/10">
          <div className="h-full rounded-none bg-mint" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
