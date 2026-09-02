import { useState } from "react";
import { Landmark, Plus, Trash2 } from "lucide-react";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";
const inputCls =
  "mt-3 w-full rounded-none border border-white/10 bg-white/[0.04] px-5 py-4 text-[16px] tracking-tight text-foreground outline-none placeholder:text-muted/60 focus:border-brand/40";

type Card = { id: string; label: string; last4: string; expiry: string };
type Payout = { id: string; bankName: string; last4: string };

function cardBrand(digits: string) {
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return "Card";
}

export function Payments() {
  const [cards, setCards] = useState<Card[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [addingCard, setAddingCard] = useState(false);
  const [addingPayout, setAddingPayout] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const addCard = () => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 12 || !cardExpiry.trim()) return;
    setCards((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2, 8), label: cardBrand(digits), last4: digits.slice(-4), expiry: cardExpiry.trim() },
    ]);
    setCardNumber("");
    setCardExpiry("");
    setAddingCard(false);
  };

  const addPayout = () => {
    const digits = accountNumber.replace(/\D/g, "");
    if (!bankName.trim() || digits.length < 4) return;
    setPayouts((prev) => [...prev, { id: Math.random().toString(36).slice(2, 8), bankName: bankName.trim(), last4: digits.slice(-4) }]);
    setBankName("");
    setAccountNumber("");
    setAddingPayout(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">Payments</h1>
      <p className="mt-3 text-[0.85rem] text-muted">
        Manage how you pay for tickets, and where your seller proceeds and cash offers go.
      </p>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-[1.1rem] font-semibold tracking-[-0.02em]">Payment methods</h2>
        {!addingCard && (
          <button
            type="button"
            onClick={() => setAddingCard(true)}
            className="flex items-center gap-1 text-[0.78rem] text-brand"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add card
          </button>
        )}
      </div>
      <p className="mt-1 text-[0.72rem] text-muted/70">
        Demo only — nothing typed here is validated, stored remotely, or charged.
      </p>

      {cards.length === 0 && !addingCard && (
        <p className="mt-4 text-[0.85rem] text-muted">No payment method saved yet.</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {cards.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-4">
            <p className="text-[0.85rem] tracking-tight">
              {c.label} •••• {c.last4} <span className="text-muted">exp {c.expiry}</span>
            </p>
            <button type="button" onClick={() => setCards((prev) => prev.filter((x) => x.id !== c.id))} aria-label="Remove card">
              <Trash2 className="h-4 w-4 text-muted hover:text-red-600" strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>

      {addingCard && (
        <div className="card mt-4 p-5">
          <p className={labelCls}>Card number</p>
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, "").slice(0, 19))}
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            className={inputCls}
          />
          <p className={`${labelCls} mt-5`}>Expiry</p>
          <input
            value={cardExpiry}
            onChange={(e) => setCardExpiry(e.target.value.replace(/[^0-9/]/g, "").slice(0, 5))}
            placeholder="MM/YY"
            className={inputCls}
          />
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={addCard}
              className="flex-1 rounded-none bg-brand py-3 text-[0.85rem] font-medium tracking-tight text-background"
            >
              Save card
            </button>
            <button
              type="button"
              onClick={() => setAddingCard(false)}
              className="flex-1 rounded-none border border-white/10 py-3 text-[0.85rem] font-medium text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 flex items-center justify-between">
        <h2 className="text-[1.1rem] font-semibold tracking-[-0.02em]">Payout accounts</h2>
        {!addingPayout && (
          <button
            type="button"
            onClick={() => setAddingPayout(true)}
            className="flex items-center gap-1 text-[0.78rem] text-brand"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} /> Add bank account
          </button>
        )}
      </div>
      <p className="mt-1 text-[0.72rem] text-muted/70">
        Where cash offers and listing proceeds are paid out once a sale settles.
      </p>

      {payouts.length === 0 && !addingPayout && (
        <p className="mt-4 text-[0.85rem] text-muted">No payout account added yet.</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {payouts.map((p) => (
          <div key={p.id} className="card flex items-center gap-3 p-4">
            <Landmark className="h-4 w-4 text-brand" strokeWidth={1.7} />
            <p className="flex-1 text-[0.85rem] tracking-tight">
              {p.bankName} <span className="text-muted">•••• {p.last4}</span>
            </p>
            <button
              type="button"
              onClick={() => setPayouts((prev) => prev.filter((x) => x.id !== p.id))}
              aria-label="Remove payout account"
            >
              <Trash2 className="h-4 w-4 text-muted hover:text-red-600" strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>

      {addingPayout && (
        <div className="card mt-4 p-5">
          <p className={labelCls}>Bank name</p>
          <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Monzo" className={inputCls} />
          <p className={`${labelCls} mt-5`}>Account number</p>
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 12))}
            inputMode="numeric"
            placeholder="12345678"
            className={inputCls}
          />
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={addPayout}
              className="flex-1 rounded-none bg-brand py-3 text-[0.85rem] font-medium tracking-tight text-background"
            >
              Save account
            </button>
            <button
              type="button"
              onClick={() => setAddingPayout(false)}
              className="flex-1 rounded-none border border-white/10 py-3 text-[0.85rem] font-medium text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
