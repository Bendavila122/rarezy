import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { marketDb, moneyFromPence, type MarketCompetition, type Seller } from "@/lib/db";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

export function SellerStorefront() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [seller, setSeller] = useState<Seller | null | undefined>(undefined);
  const [competitions, setCompetitions] = useState<MarketCompetition[]>([]);

  useEffect(() => {
    if (!sellerId) return;
    marketDb.fetchPublicSeller(sellerId).then(setSeller);
    marketDb.fetchSellerLiveCompetitions(sellerId).then(setCompetitions);
  }, [sellerId]);

  if (seller === undefined) return null;
  if (!seller) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-[0.9rem] text-muted">That seller isn't here any more.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className={labelCls}>Verified Rarezy seller</p>
      <h1 className="mt-2 flex items-center gap-2 text-[1.9rem] font-semibold tracking-[-0.03em]">
        {seller.businessName}
        <BadgeCheck className="h-6 w-6 text-blue-400" strokeWidth={2} />
      </h1>
      {seller.website && (
        <a href={seller.website} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[0.8rem] text-brand underline underline-offset-4">
          {seller.website}
        </a>
      )}

      <h2 className="mt-10 text-[1.2rem] font-semibold tracking-[-0.02em]">Competitions</h2>
      {competitions.length === 0 ? (
        <p className="mt-6 text-[0.85rem] text-muted">Nothing live from this seller right now.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {competitions.map((c) => (
            <Link key={c.id} to={`/c/${c.id}`} className="press card overflow-hidden">
              {c.product.images[0] && (
                <img src={c.product.images[0].url} alt="" className="aspect-square w-full object-cover" />
              )}
              <div className="p-3">
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-muted">{c.product.brand}</p>
                <p className="mt-1 text-[0.85rem] tracking-tight">{c.product.model}</p>
                <p className="tabular mt-2 text-[0.9rem] font-semibold text-brand">{moneyFromPence(c.ticketPricePence)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
