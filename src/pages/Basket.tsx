import { Link } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2, CreditCard, Minus, Plus, Trash2 } from "lucide-react";
import { entryPricing, formatDate, money, titleOf } from "@/lib/marketplace";
import { rarezy, useRarezy, type CompetitionListing } from "@/lib/store";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";
type PayMethod = "card" | "apple-pay";

export function Basket() {
  const { records, basket } = useRarezy();
  const [error, setError] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [paid, setPaid] = useState(false);

  const items = basket
    .map((b) => {
      const c = records.find((r) => r.id === b.listingId && r.kind === "competition") as
        | CompetitionListing
        | undefined;
      return c ? { c, qty: b.qty } : null;
    })
    .filter((x): x is { c: CompetitionListing; qty: number } => x !== null);

  const totalTickets = items.reduce((sum, { qty }) => sum + qty, 0);
  const subtotal = items.reduce((sum, { c, qty }) => sum + c.entryFee * qty, 0);
  const fees = items.reduce((sum, { c, qty }) => sum + (entryPricing(c.entryFee).charge - c.entryFee) * qty, 0);
  const total = items.reduce((sum, { c, qty }) => sum + entryPricing(c.entryFee).charge * qty, 0);

  const checkout = () => {
    const result = rarezy.checkoutBasket();
    if (!result.ok) {
      setError("Your basket is empty.");
      return;
    }
    setPaid(true);
  };

  if (paid) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex flex-col items-center pt-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-brand" strokeWidth={1.6} />
          <h1 className="mt-4 text-[1.6rem] font-semibold tracking-[-0.03em]">Payment successful</h1>
          <p className="mt-3 max-w-[20rem] text-[0.85rem] leading-relaxed text-muted">
            Your tickets are in. Head to your entries to see your chances to play.
          </p>
          <Link
            to="/entries"
            className="mt-8 w-full max-w-xs rounded-none bg-brand py-4 text-center text-[0.9rem] font-medium tracking-tight text-background"
          >
            Go to your entries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">Basket</h1>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-[0.9rem] text-muted">
          Your basket is empty.{" "}
          <Link to="/browse" className="text-brand underline underline-offset-4">
            Browse watches
          </Link>{" "}
          and add a ticket.
        </p>
      ) : (
        <>
          <div className="mt-8 flex flex-col gap-4">
            {items.map(({ c, qty }) => (
              <div key={c.id} className="card flex gap-4 p-4">
                {c.item.photos?.[0] && (
                  <Link to={`/item/${c.id}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-none bg-white/[0.04]">
                    <img src={c.item.photos[0]} alt={titleOf(c.item)} className="h-full w-full object-cover" />
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[0.62rem] uppercase tracking-[0.2em] text-muted">{c.item.brand}</p>
                      <Link to={`/item/${c.id}`} className="mt-1 block truncate text-[0.9rem] tracking-tight">
                        {titleOf(c.item)}
                      </Link>
                      <p className="mt-1 text-[0.68rem] text-muted">Ends {formatDate(c.deadlineAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => rarezy.removeFromBasket(c.id)}
                      aria-label="Remove from basket"
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-muted hover:text-red-600" strokeWidth={1.8} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-none border border-white/10 px-1 py-1">
                      <button
                        type="button"
                        onClick={() => rarezy.setBasketQty(c.id, qty - 1)}
                        disabled={qty <= 1}
                        aria-label="Decrease tickets"
                        className="flex h-6 w-6 items-center justify-center rounded-none text-muted disabled:opacity-30"
                      >
                        <Minus className="h-3 w-3" strokeWidth={2} />
                      </button>
                      <span className="tabular w-6 text-center text-[0.8rem]">{qty}</span>
                      <button
                        type="button"
                        onClick={() => rarezy.setBasketQty(c.id, qty + 1)}
                        aria-label="Increase tickets"
                        className="flex h-6 w-6 items-center justify-center rounded-none text-muted"
                      >
                        <Plus className="h-3 w-3" strokeWidth={2} />
                      </button>
                    </div>
                    <p className="tabular text-[0.9rem] font-medium">
                      {money(entryPricing(c.entryFee).charge * qty)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card mt-6 p-5">
            <p className={labelCls}>Order summary</p>
            <div className="mt-3 flex items-center justify-between text-[0.82rem]">
              <span className="text-muted">
                {totalTickets} ticket{totalTickets > 1 ? "s" : ""}
              </span>
              <span className="tabular">{money(subtotal)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[0.82rem]">
              <span className="text-muted">Processing fee (50%, VAT incl.)</span>
              <span className="tabular">{money(fees)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[0.95rem] font-medium">
              <span>Total</span>
              <span className="tabular">{money(total)}</span>
            </div>
          </div>

          <div className="mt-6">
            <p className={labelCls}>Pay with</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayMethod("card")}
                className={`flex items-center justify-center gap-2 rounded-none border py-3.5 text-[0.85rem] font-medium tracking-tight transition-all ${
                  payMethod === "card" ? "border-brand bg-brand/10 text-brand" : "border-white/10 text-muted"
                }`}
              >
                <CreditCard className="h-4 w-4" strokeWidth={1.8} />
                Card
              </button>
              <button
                type="button"
                onClick={() => setPayMethod("apple-pay")}
                className={`flex items-center justify-center gap-2 rounded-none border py-3.5 text-[0.85rem] font-medium tracking-tight transition-all ${
                  payMethod === "apple-pay" ? "border-brand bg-brand/10 text-brand" : "border-white/10 text-muted"
                }`}
              >
                 Apple Pay
              </button>
            </div>

            {error && <p className="mt-3 text-[0.72rem] text-red-600">{error}</p>}

            <button
              type="button"
              onClick={checkout}
              className="mt-4 w-full rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background"
            >
              {payMethod === "apple-pay" ? "Pay with  Apple Pay" : "Pay with card"} — {money(total)}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
