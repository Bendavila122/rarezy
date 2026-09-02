import { Link } from "react-router-dom";
import { Flame, Heart, ShoppingBag } from "lucide-react";
import { formatDate, money, titleOf } from "@/lib/marketplace";
import { rarezy, useRarezy, type CompetitionListing } from "@/lib/store";
import { authGate } from "@/lib/authGate";
import { browseState } from "@/lib/browseState";
import { CountdownBadge } from "@/components/Countdown";
import { TiltCard } from "@/components/TiltCard";

export function ListingCard({ listing: c }: { listing: CompetitionListing }) {
  const { watchlist, currentUser } = useRarezy();
  const watched = watchlist.includes(c.id);
  const popular = c.entriesTotal > 0 && c.entriesSold / c.entriesTotal >= 0.6;

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
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
            {popular && (
              <span className="glass-dark absolute left-2.5 top-2.5 flex items-center gap-1 rounded-none px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wide">
                <Flame className="h-3 w-3 text-amber-400" strokeWidth={2.4} />
                Popular
              </span>
            )}
            <span className="glass-dark absolute bottom-2.5 left-2.5 rounded-none px-2.5 py-1 text-[0.78rem] font-semibold tracking-tight">
              {money(c.entryFee)}
            </span>
          </div>
        )}
        <div className="p-4 pb-16">
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted">{c.item.brand}</p>
          <p className="mt-1.5 text-[0.92rem] leading-snug tracking-tight">{titleOf(c.item)}</p>
          <div className="mt-1.5">
            <CountdownBadge deadlineAt={c.deadlineAt} />
          </div>
          <p className="mt-1 text-[0.68rem] text-muted">Ends {formatDate(c.deadlineAt)}</p>
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          if (!currentUser) {
            authGate.request("Create a free account to save watches you're keeping an eye on.");
            return;
          }
          rarezy.toggleWatchlist(c.id);
        }}
        aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
        aria-pressed={watched}
        className="press glass absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-none"
      >
        <Heart className={watched ? "h-4 w-4 fill-brand text-brand" : "h-4 w-4 text-foreground"} strokeWidth={1.8} />
      </button>

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
        className="press absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-none bg-brand py-2.5 text-[0.76rem] font-medium tracking-tight text-background"
      >
        <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} />
        Add to basket
      </button>
    </div>
    </TiltCard>
  );
}

/** Narrow, fixed-width card for horizontal-scroll rows (App Store "carousel" style). */
export function ListingCardCompact({ listing: c }: { listing: CompetitionListing }) {
  return (
    <Link to={`/item/${c.id}`} className="card press block w-40 shrink-0 overflow-hidden">
      {c.item.photos?.[0] && (
        <div className="relative aspect-square w-full overflow-hidden bg-white/[0.04]">
          <img src={c.item.photos[0]} alt={titleOf(c.item)} className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/55 to-transparent" />
          <span className="absolute right-2 top-2">
            <CountdownBadge deadlineAt={c.deadlineAt} />
          </span>
          <span className="glass-dark absolute bottom-2 left-2 rounded-none px-2 py-0.5 text-[0.68rem] font-semibold tracking-tight">
            {money(c.entryFee)}
          </span>
        </div>
      )}
      <div className="p-3">
        <p className="text-[0.56rem] uppercase tracking-[0.18em] text-muted">{c.item.brand}</p>
        <p className="mt-1 truncate text-[0.8rem] tracking-tight">{titleOf(c.item)}</p>
      </div>
    </Link>
  );
}
