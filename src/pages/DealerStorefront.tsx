import { useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, Star } from "lucide-react";
import { dealerById } from "@/lib/dealers";
import { useRarezy, type CompetitionListing } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

/** A dealer's public shop — their rating, sold count and every one of their listings currently live, reached by tapping through from any of their product pages. */
export function DealerStorefront() {
  const { dealerId } = useParams<{ dealerId: string }>();
  const navigate = useNavigate();
  const { records } = useRarezy();
  const dealer = dealerById(dealerId);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/browse");
  };

  if (!dealer) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <button type="button" onClick={goBack} className="text-[0.8rem] text-muted hover:text-foreground">
          ← Back
        </button>
        <p className="mt-6 text-[0.9rem] text-muted">That dealer isn't here any more.</p>
      </div>
    );
  }

  const listings = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && r.status === "live" && r.dealerId === dealer.id,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <button type="button" onClick={goBack} className="text-[0.8rem] text-muted hover:text-foreground">
        ← Back
      </button>
      <div className="mt-6 flex items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-[1.3rem] font-semibold tracking-tight">
          {dealer.name.slice(0, 1)}
        </div>
        <div className="min-w-0">
          <p className={labelCls}>Verified dealer</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-[1.6rem] font-semibold tracking-[-0.02em]">
            {dealer.name}
            <BadgeCheck className="h-5 w-5 shrink-0 text-blue-400" strokeWidth={2.2} />
          </h1>
          <p className="mt-1 text-[0.85rem] text-muted">{dealer.tagline}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-none border border-white/10 bg-white/[0.03] p-4">
          <p className={labelCls}>Rating</p>
          <p className="tabular mt-2 flex items-center gap-1.5 text-[1.2rem] font-semibold leading-none tracking-[-0.02em]">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" strokeWidth={0} />
            {dealer.rating.toFixed(1)}
          </p>
          <p className="mt-1 text-[0.68rem] text-muted">{dealer.reviewCount} reviews</p>
        </div>
        <div className="rounded-none border border-white/10 bg-white/[0.03] p-4">
          <p className={labelCls}>Items sold</p>
          <p className="tabular mt-2 text-[1.2rem] font-semibold leading-none tracking-[-0.02em]">
            {dealer.soldCount.toLocaleString("en-GB")}
          </p>
        </div>
        <div className="rounded-none border border-white/10 bg-white/[0.03] p-4">
          <p className={labelCls}>Member since</p>
          <p className="tabular mt-2 text-[1.2rem] font-semibold leading-none tracking-[-0.02em]">{dealer.memberSince}</p>
        </div>
        <div className="rounded-none border border-white/10 bg-white/[0.03] p-4">
          <p className={labelCls}>Location</p>
          <p className="mt-2 text-[1.2rem] font-semibold leading-none tracking-[-0.02em]">{dealer.location}</p>
        </div>
      </div>

      <h2 className="mt-12 text-[1.2rem] font-semibold tracking-[-0.02em]">
        {listings.length} live listing{listings.length === 1 ? "" : "s"}
      </h2>
      {listings.length === 0 ? (
        <p className="mt-6 text-[0.85rem] text-muted">Nothing live from this dealer right now.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((c) => (
            <ListingCard key={c.id} listing={c} />
          ))}
        </div>
      )}
    </div>
  );
}
