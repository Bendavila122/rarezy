import { Link } from "react-router-dom";
import { BadgeCheck, ChevronRight, ShieldCheck, Star } from "lucide-react";
import type { Dealer } from "@/lib/dealers";

/** A tappable summary of the dealer behind a listing — name, verified badge, rating, sold count, location — linking through to their full shop. */
export function DealerCard({ dealer }: { dealer: Dealer }) {
  return (
    <Link
      to={`/dealer/${dealer.id}`}
      className="press flex items-center gap-4 rounded-none border border-white/10 bg-white/[0.03] p-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-[1rem] font-semibold tracking-tight">
        {dealer.name.slice(0, 1)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[0.92rem] font-semibold tracking-tight">
          <span className="truncate">{dealer.name}</span>
          <BadgeCheck className="h-4 w-4 shrink-0 text-blue-400" strokeWidth={2.2} />
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.74rem] text-muted">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" strokeWidth={0} />
            {dealer.rating.toFixed(1)} ({dealer.reviewCount})
          </span>
          <span>{dealer.soldCount.toLocaleString("en-GB")} sold</span>
          <span>{dealer.location}</span>
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted" strokeWidth={2} />
    </Link>
  );
}

/** The house-stock equivalent of `DealerCard` — same shape, no shop to visit. */
export function HouseStockCard() {
  return (
    <div className="flex items-center gap-4 rounded-none border border-white/10 bg-white/[0.03] p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint/15 text-mint">
        <ShieldCheck className="h-5 w-5" strokeWidth={1.9} />
      </div>
      <div>
        <p className="text-[0.92rem] font-semibold tracking-tight">Sold by Rarezy</p>
        <p className="mt-1 text-[0.74rem] text-muted">
          Bought back and held in our own vault — inspected and authenticated in-house.
        </p>
      </div>
    </div>
  );
}
