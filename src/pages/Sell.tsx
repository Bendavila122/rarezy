import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  BRANDS,
  CATEGORIES,
  CONDITIONS,
  DEADLINE_OPTIONS,
  MIN_COMPETITION_VALUE,
  entryPricing,
  estimateValue,
  glyphOf,
  money,
  suggestEntryCount,
  type Condition,
  type ItemCategory,
  type LuxuryItem,
} from "@/lib/marketplace";
import { more4me } from "@/lib/store";

function Chip({
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
      className={`rounded-full border px-4 py-2.5 text-[0.8rem] tracking-tight transition-all active:scale-[0.97] ${
        active ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/4 text-muted"
      }`}
    >
      {children}
    </button>
  );
}

const inputCls =
  "mt-3 w-full rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-[16px] tracking-tight text-foreground outline-none placeholder:text-muted/60 focus:border-gold/40";
const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

type Step = "details" | "valuation" | "competition" | "cash-done" | "competition-done";

export function Sell() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("details");

  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [model, setModel] = useState("");
  const [reference, setReference] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [condition, setCondition] = useState<Condition>("excellent");
  const [purchasePrice, setPurchasePrice] = useState("");

  const [entryFee, setEntryFee] = useState(2);
  const [minimumPrice, setMinimumPrice] = useState("");
  const [deadlineDays, setDeadlineDays] = useState<number>(30);

  const [cashAccepted, setCashAccepted] = useState<number | null>(null);

  const price = Number(purchasePrice) || 0;
  const item: LuxuryItem | null =
    category && brand && model.trim() && price > 0
      ? {
          category,
          brand,
          model: model.trim(),
          reference: reference.trim() || undefined,
          year: Number(year) || new Date().getFullYear(),
          condition,
          purchasePrice: price,
        }
      : null;

  const offer = item ? estimateValue(item) : null;
  const canEnterCompetition = (item?.purchasePrice ?? 0) >= MIN_COMPETITION_VALUE;
  const entriesTotal = offer ? suggestEntryCount(offer.ceiling, entryFee) : 0;
  const pricing = entryPricing(entryFee);
  const minValue = Number(minimumPrice) || 0;

  const openCompetitionSetup = () => {
    if (!offer) return;
    setMinimumPrice(String(offer.suggestedMinimum));
    setEntryFee(price > 50000 ? 25 : price > 15000 ? 5 : 2);
    setStep("competition");
  };

  const acceptCash = () => {
    if (!item || !offer) return;
    more4me.acceptCash(item, offer, offer.cashHigh);
    setCashAccepted(offer.cashHigh);
    setStep("cash-done");
  };

  const submitCompetition = () => {
    if (!item) return;
    more4me.startCompetition(item, { entryFee, entriesTotal, minimumPrice: minValue, deadlineDays });
    setStep("competition-done");
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <AnimatePresence mode="wait">
        {step === "details" && (
          <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">
              What are you selling?
            </h1>
            <Link to="/account" className="mt-3 inline-block text-[0.72rem] text-muted underline underline-offset-4">
              My listings
            </Link>

            <p className={`${labelCls} mt-9`}>Category</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Chip
                  key={c.id}
                  active={category === c.id}
                  onClick={() => {
                    setCategory(c.id);
                    setBrand(null);
                  }}
                >
                  {c.glyph} {c.label}
                </Chip>
              ))}
            </div>

            {category && (
              <>
                <p className={`${labelCls} mt-8`}>Brand</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {BRANDS[category].map((b) => (
                    <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>
                      {b}
                    </Chip>
                  ))}
                </div>
              </>
            )}

            {brand && (
              <>
                <p className={`${labelCls} mt-8`}>Model</p>
                <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Submariner Date" className={inputCls} />

                <p className={`${labelCls} mt-8`}>Reference · optional</p>
                <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="126610LN" className={inputCls} />

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div>
                    <p className={labelCls}>Year</p>
                    <input
                      value={year}
                      onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                      inputMode="numeric"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <p className={labelCls}>You paid</p>
                    <input
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value.replace(/[^0-9.]/g, ""))}
                      inputMode="decimal"
                      placeholder="8450"
                      className={inputCls}
                    />
                  </div>
                </div>

                <p className={`${labelCls} mt-8`}>Condition</p>
                <div className="mt-3 flex flex-col gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCondition(c.id)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                        condition === c.id ? "border-gold/40 bg-gold/10" : "border-white/10 bg-white/4"
                      }`}
                    >
                      <span>
                        <span className="block text-[0.88rem] tracking-tight">{c.label}</span>
                        <span className="block text-[0.68rem] text-muted">{c.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-12">
                  <button
                    type="button"
                    onClick={() => setStep("valuation")}
                    disabled={!item}
                    className="w-full rounded-full bg-gold py-4 text-[0.9rem] font-medium tracking-tight text-background disabled:opacity-30"
                  >
                    Get my offer
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {step === "valuation" && item && offer && (
          <motion.div key="valuation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className={labelCls}>
              {glyphOf(item.category)} {item.brand} {item.model}
            </p>
            <h1 className="mt-3 text-[1.6rem] font-semibold leading-tight tracking-[-0.03em]">
              Here's what the market says
            </h1>

            <div className="card mt-8 p-6">
              <p className={labelCls}>Instant cash offer</p>
              <p className="tabular mt-3 text-[1.8rem] font-semibold leading-none tracking-[-0.04em]">
                {money(offer.cashLow)} – {money(offer.cashHigh)}
              </p>
              <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
                Deposited within 48 hours. No shipping, no waiting.
              </p>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={acceptCash}
                  className="w-full rounded-full border border-gold/40 py-3.5 text-[0.88rem] font-medium tracking-tight text-gold"
                >
                  Take {money(offer.cashHigh)} now
                </button>
              </div>
            </div>

            <div className="card mt-5 p-6">
              <p className={labelCls}>List it on More4Me</p>
              <p className="tabular mt-3 text-[1.8rem] font-semibold leading-none tracking-[-0.04em] text-gold">
                Up to {money(offer.ceiling)}
              </p>
              <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
                Ship it in free of charge. Our partner jeweller authenticates it, checks it against
                stolen-item registers, certifies and photographs it, then holds it insured while
                players compete to win it. You set the price, the minimum you'll accept, and the
                deadline.
              </p>
              {canEnterCompetition ? (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={openCompetitionSetup}
                    className="w-full rounded-full border border-gold/40 py-3.5 text-[0.88rem] font-medium tracking-tight text-gold"
                  >
                    Set up on More4Me
                  </button>
                </div>
              ) : (
                <p className="mt-5 text-[0.72rem] text-muted">
                  More4Me needs an item worth {money(MIN_COMPETITION_VALUE)} or more.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {step === "competition" && item && offer && (
          <motion.div key="competition" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h1 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.03em]">Set your competition</h1>

            <p className={`${labelCls} mt-8`}>Entry price</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 5, 10, 25, 50].map((v) => (
                <Chip key={v} active={entryFee === v} onClick={() => setEntryFee(v)}>
                  {money(v)}
                </Chip>
              ))}
            </div>
            <p className="mt-4 text-[0.78rem] text-muted">
              {entriesTotal.toLocaleString("en-GB")} entries at {money(entryFee)} raises up to{" "}
              {money(entriesTotal * entryFee)}.
            </p>
            <p className="mt-2 text-[0.72rem] text-muted/70">
              Each entry costs a player {money(pricing.charge)} at checkout — {money(pricing.entryFee)}{" "}
              towards your price, {money(pricing.profit)} kept by More4Me once VAT is accounted for.
            </p>

            <p className={`${labelCls} mt-8`}>Minimum you'll accept</p>
            <input
              value={minimumPrice}
              onChange={(e) => setMinimumPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              className={inputCls}
            />
            <p className="mt-2 text-[0.72rem] text-muted/70">
              Between {money(offer.cashHigh)} and {money(offer.ceiling)}. Miss it by the deadline and
              you choose what happens next — nothing is decided for you.
            </p>

            <p className={`${labelCls} mt-8`}>Deadline</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEADLINE_OPTIONS.map((d) => (
                <Chip key={d} active={deadlineDays === d} onClick={() => setDeadlineDays(d)}>
                  {d} days
                </Chip>
              ))}
            </div>

            <div className="mt-12">
              <button
                type="button"
                onClick={submitCompetition}
                disabled={minValue < offer.cashHigh || minValue > offer.ceiling}
                className="w-full rounded-full bg-gold py-4 text-[0.9rem] font-medium tracking-tight text-background disabled:opacity-30"
              >
                Ship it in
              </button>
            </div>
          </motion.div>
        )}

        {step === "cash-done" && cashAccepted !== null && (
          <motion.div
            key="cash-done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center pt-16 text-center"
          >
            <p className={labelCls}>Offer accepted</p>
            <p className="tabular mt-4 text-[2.8rem] font-semibold leading-none tracking-[-0.04em] text-gold">
              {money(cashAccepted)}
            </p>
            <p className="mt-5 max-w-[16rem] text-[0.85rem] leading-relaxed text-muted">
              Added to your More4Me wallet, arriving within 48 hours in a real deployment.
            </p>
            <div className="mt-12 w-full">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full rounded-full bg-gold py-4 text-[0.9rem] font-medium tracking-tight text-background"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}

        {step === "competition-done" && (
          <motion.div
            key="competition-done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center pt-16 text-center"
          >
            <p className={labelCls}>On its way to us</p>
            <p className="mt-4 max-w-[17rem] text-[1.2rem] font-semibold leading-snug tracking-[-0.025em]">
              We'll authenticate, certify and list it — free of charge.
            </p>
            <p className="mt-5 max-w-[16rem] text-[0.85rem] leading-relaxed text-muted">
              You'll see it go live from My Listings once our partner jeweller has checked it over.
            </p>
            <div className="mt-12 w-full">
              <button
                type="button"
                onClick={() => navigate("/account")}
                className="w-full rounded-full bg-gold py-4 text-[0.9rem] font-medium tracking-tight text-background"
              >
                My listings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
