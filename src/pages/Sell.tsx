import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  CONDITIONS,
  DEADLINE_OPTIONS,
  MIN_COMPETITION_VALUE,
  WATCH_BRANDS,
  entryPricing,
  estimateValue,
  money,
  suggestEntryCount,
  type Condition,
  type LuxuryItem,
} from "@/lib/marketplace";
import { rarezy, useRarezy } from "@/lib/store";
import { AccountRequired } from "@/components/AccountRequired";

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
      className={`rounded-none border px-4 py-2.5 text-[0.8rem] tracking-tight transition-all active:scale-[0.97] ${
        active ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
      }`}
    >
      {children}
    </button>
  );
}

const inputCls =
  "mt-3 w-full rounded-none border border-white/10 bg-white/[0.04] px-5 py-4 text-[16px] tracking-tight text-foreground outline-none placeholder:text-muted/60 focus:border-brand/40";
const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

type Step = "details" | "valuation" | "competition" | "cash-done" | "competition-done";

export function Sell() {
  const navigate = useNavigate();
  const { currentUser } = useRarezy();
  const [step, setStep] = useState<Step>("details");

  const [brand, setBrand] = useState<string | null>(null);
  const [model, setModel] = useState("");
  const [reference, setReference] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [condition, setCondition] = useState<Condition>("excellent");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    setPhotos((prev) => [...prev, ...Array.from(files).map((f) => URL.createObjectURL(f))].slice(0, 8));
  };
  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
    URL.revokeObjectURL(url);
  };

  const [entryFee, setEntryFee] = useState(2);
  const [minimumPrice, setMinimumPrice] = useState("");
  const [deadlineDays, setDeadlineDays] = useState<number>(30);

  const [cashAccepted, setCashAccepted] = useState<number | null>(null);

  const price = Number(purchasePrice) || 0;
  const item: LuxuryItem | null =
    brand && model.trim() && price > 0
      ? {
          brand,
          model: model.trim(),
          reference: reference.trim() || undefined,
          year: Number(year) || new Date().getFullYear(),
          condition,
          purchasePrice: price,
          description: description.trim() || undefined,
          photos: photos.length > 0 ? photos : undefined,
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
    rarezy.acceptCash(item, offer, offer.cashHigh);
    setCashAccepted(offer.cashHigh);
    setStep("cash-done");
  };

  const submitCompetition = () => {
    if (!item) return;
    rarezy.startCompetition(item, { entryFee, entriesTotal, minimumPrice: minValue, deadlineDays });
    setStep("competition-done");
  };

  if (!currentUser) {
    return (
      <AccountRequired
        title="Create an account to sell"
        body="Set up a free account so we know where to send your offer or list your watch."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <AnimatePresence mode="wait">
        {step === "details" && (
          <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">
              What watch are you selling?
            </h1>
            <Link to="/account" className="mt-3 inline-block text-[0.72rem] text-muted underline underline-offset-4">
              My listings
            </Link>

            <p className={`${labelCls} mt-9`}>Brand</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {WATCH_BRANDS.map((b) => (
                <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>
                  {b}
                </Chip>
              ))}
            </div>

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

                <p className={`${labelCls} mt-8`}>Photos · optional</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {photos.map((url) => (
                    <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-none border border-white/10">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(url)}
                        aria-label="Remove photo"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-none bg-black/60 text-white"
                      >
                        <X className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                  {photos.length < 8 && (
                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-none border border-dashed border-white/15 bg-white/[0.04] text-muted transition-colors hover:border-brand/40 hover:text-brand">
                      <ImagePlus className="h-5 w-5" strokeWidth={1.6} />
                      <span className="text-[0.6rem] tracking-tight">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => addPhotos(e.target.files)}
                      />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-[0.68rem] text-muted/70">
                  Dial, case back, box and papers — clear photos get a stronger offer.
                </p>

                <p className={`${labelCls} mt-8`}>Description · optional</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Service history, box and papers, any marks or wear — the more detail, the stronger the listing."
                  className={`${inputCls} resize-none`}
                />

                <p className={`${labelCls} mt-8`}>Condition</p>
                <div className="mt-3 flex flex-col gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCondition(c.id)}
                      className={`flex items-center justify-between rounded-none border px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                        condition === c.id ? "border-brand/40 bg-brand/10" : "border-white/10 bg-white/[0.04]"
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
                    className="w-full rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background disabled:opacity-30"
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
              {item.brand} {item.model}
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
                  className="w-full rounded-none border border-brand/40 py-3.5 text-[0.88rem] font-medium tracking-tight text-brand"
                >
                  Take {money(offer.cashHigh)} now
                </button>
              </div>
            </div>

            <div className="card mt-5 p-6">
              <p className={labelCls}>List it on Rarezy</p>
              <p className="tabular mt-3 text-[1.8rem] font-semibold leading-none tracking-[-0.04em] text-brand">
                Up to {money(offer.ceiling)}
              </p>
              <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
                Ship it in free of charge. Our partner watch specialist authenticates it, checks it against
                stolen-item registers, certifies and photographs it, then holds it insured while
                players compete to win it. You set the price, the minimum you'll accept, and the
                deadline.
              </p>
              {canEnterCompetition ? (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={openCompetitionSetup}
                    className="w-full rounded-none border border-brand/40 py-3.5 text-[0.88rem] font-medium tracking-tight text-brand"
                  >
                    Set up on Rarezy
                  </button>
                </div>
              ) : (
                <p className="mt-5 text-[0.72rem] text-muted">
                  Rarezy needs a watch worth {money(MIN_COMPETITION_VALUE)} or more.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {step === "competition" && item && offer && (
          <motion.div key="competition" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h1 className="text-[1.6rem] font-semibold leading-tight tracking-[-0.03em]">Price your listing</h1>

            <p className={`${labelCls} mt-8`}>Ticket price</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 5, 10, 25, 50].map((v) => (
                <Chip key={v} active={entryFee === v} onClick={() => setEntryFee(v)}>
                  {money(v)}
                </Chip>
              ))}
            </div>
            <p className="mt-4 text-[0.78rem] text-muted">
              {entriesTotal.toLocaleString("en-GB")} tickets at {money(entryFee)} raises up to{" "}
              {money(entriesTotal * entryFee)}.
            </p>
            <p className="mt-2 text-[0.72rem] text-muted/70">
              At checkout, a player pays your {money(entryFee)} ticket price plus a 50% processing
              fee — {money(pricing.charge)} total. {money(pricing.profit)} of that fee is kept by
              Rarezy once VAT is accounted for; the rest goes toward your price.
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
                className="w-full rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background disabled:opacity-30"
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
            <p className="tabular mt-4 text-[2.8rem] font-semibold leading-none tracking-[-0.04em] text-brand">
              {money(cashAccepted)}
            </p>
            <p className="mt-5 max-w-[16rem] text-[0.85rem] leading-relaxed text-muted">
              Paid out to your linked account within 48 hours.
            </p>
            <div className="mt-12 w-full">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background"
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
              You'll see it go live from My Listings once our partner watch specialist has checked it over.
            </p>
            <div className="mt-12 w-full">
              <button
                type="button"
                onClick={() => navigate("/account")}
                className="w-full rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background"
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
