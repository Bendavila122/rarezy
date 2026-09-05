import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { CONDITIONS, WATCH_BRANDS, estimateValue, money, type Condition, type ItemCategory, type LuxuryItem } from "@/lib/marketplace";
import { rarezy, useRarezy } from "@/lib/store";
import { AccountRequired } from "@/components/AccountRequired";
import { CATEGORY_LABELS } from "@/components/FilterDrawer";

/** Every category we'll take, excluding "cash" — that's a prize type on the buyer side, not something anyone sells us. */
const SELLABLE_CATEGORIES: ItemCategory[] = ["watch", "jewellery", "handbag", "clothing", "electronics", "car"];

const MODEL_PLACEHOLDER: Record<ItemCategory, string> = {
  watch: "Submariner Date",
  jewellery: "Love Bracelet",
  handbag: "Birkin 30",
  clothing: "Trench Coat",
  electronics: "MacBook Pro",
  car: "911 Carrera 4S",
  cash: "",
};

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

type Step = "details" | "review" | "submitted";

export function Sell() {
  const navigate = useNavigate();
  const { currentUser } = useRarezy();
  const [step, setStep] = useState<Step>("details");

  const [category, setCategory] = useState<ItemCategory | null>(null);
  const [brand, setBrand] = useState<string | null>(null);
  const [model, setModel] = useState("");
  const [reference, setReference] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [condition, setCondition] = useState<Condition>("excellent");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [purchasedFrom, setPurchasedFrom] = useState("");

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    setPhotos((prev) => [...prev, ...Array.from(files).map((f) => URL.createObjectURL(f))].slice(0, 8));
  };
  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
    URL.revokeObjectURL(url);
  };

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
          description: description.trim() || undefined,
          photos: photos.length > 0 ? photos : undefined,
        }
      : null;

  const offer = item ? estimateValue(item) : null;

  // A ref, not state — AnimatePresence keeps the review step's button
  // mounted (with its original stale onClick closure) through its exit
  // animation, so a state check here wouldn't see a second rapid click
  // coming in on that same stale handler. A ref is shared mutable storage
  // every closure reads live, so it still catches it.
  const submittedRef = useRef(false);
  const submit = () => {
    if (!item || submittedRef.current) return;
    submittedRef.current = true;
    rarezy.submitForReview(item, purchasedFrom);
    setStep("submitted");
  };

  if (!currentUser) {
    return (
      <AccountRequired
        title="Create an account to sell"
        body="Set up a free account so we know where to send your cash offer."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <AnimatePresence mode="wait">
        {step === "details" && (
          <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">
              What are you selling?
            </h1>
            <p className="mt-2 text-[0.85rem] text-muted">
              We buy watches, jewellery, handbags, clothing, electronics and cars — for the right price.
            </p>
            <Link to="/account" className="mt-3 inline-block text-[0.72rem] text-muted underline underline-offset-4">
              My sell requests
            </Link>

            <p className={`${labelCls} mt-9`}>Category</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SELLABLE_CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  active={category === c}
                  onClick={() => {
                    setCategory(c);
                    setBrand(null);
                  }}
                >
                  {CATEGORY_LABELS[c] ?? c}
                </Chip>
              ))}
            </div>

            {category && (
              <>
                <p className={`${labelCls} mt-8`}>Brand</p>
                {category === "watch" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {WATCH_BRANDS.map((b) => (
                      <Chip key={b} active={brand === b} onClick={() => setBrand(b)}>
                        {b}
                      </Chip>
                    ))}
                  </div>
                ) : (
                  <input
                    value={brand ?? ""}
                    onChange={(e) => setBrand(e.target.value || null)}
                    placeholder="Hermès"
                    className={inputCls}
                  />
                )}
              </>
            )}

            {category && brand && (
              <>
                <p className={`${labelCls} mt-8`}>Model</p>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={MODEL_PLACEHOLDER[category]}
                  className={inputCls}
                />

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
                  Clear photos from every angle, plus box, papers or authenticity extras — the more detail, the stronger the offer.
                </p>

                <p className={`${labelCls} mt-8`}>Where did you buy it?</p>
                <input
                  value={purchasedFrom}
                  onChange={(e) => setPurchasedFrom(e.target.value)}
                  placeholder="Authorised dealer, private sale, auction house…"
                  className={inputCls}
                />
                <p className="mt-2 text-[0.68rem] text-muted/70">
                  Part of the authenticity check — we may ask for a receipt or paperwork.
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
                    onClick={() => setStep("review")}
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

        {step === "review" && item && offer && (
          <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className={labelCls}>
              {item.brand} {item.model}
            </p>
            <h1 className="mt-3 text-[1.6rem] font-semibold leading-tight tracking-[-0.03em]">
              Here's roughly what it's worth
            </h1>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
              Ballpark only, from market data — not an offer yet. Your real cash offer lands in your
              dashboard once we've checked the images and details over.
            </p>

            <div className="card mt-8 p-6">
              <p className={labelCls}>Indicative cash range</p>
              <p className="tabular mt-3 text-[1.8rem] font-semibold leading-none tracking-[-0.04em]">
                {money(offer.cashLow)} – {money(offer.cashHigh)}
              </p>
            </div>

            <h2 className="mt-9 text-[1rem] font-semibold tracking-[-0.02em]">What happens next</h2>
            <ol className="mt-4 flex flex-col gap-3 text-[0.82rem] leading-relaxed text-muted">
              <li>
                <span className="font-medium text-foreground">1. We review it.</span> Your photos,
                details and where you bought it get checked against market data and our authenticity
                checklist.
              </li>
              <li>
                <span className="font-medium text-foreground">2. A real cash offer lands in your dashboard.</span>{" "}
                Accept it, or decline — no obligation either way.
              </li>
              <li>
                <span className="font-medium text-foreground">3. A rep visits you.</span> We come to
                your home or office to inspect it in person and pay out there and then — one visit, one
                decision on the spot.
              </li>
              <li>
                <span className="font-medium text-foreground">4. Cash is paid.</span> Straight into your
                account the moment our specialist confirms it in person.
              </li>
            </ol>

            <div className="mt-12">
              <button
                type="button"
                onClick={submit}
                className="w-full rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background"
              >
                Submit for review
              </button>
            </div>
          </motion.div>
        )}

        {step === "submitted" && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center pt-16 text-center"
          >
            <p className={labelCls}>Submitted</p>
            <p className="mt-4 max-w-[17rem] text-[1.2rem] font-semibold leading-snug tracking-[-0.025em]">
              We're reviewing it now.
            </p>
            <p className="mt-5 max-w-[16rem] text-[0.85rem] leading-relaxed text-muted">
              You'll see your offer land in My Account as soon as it's checked over.
            </p>
            <div className="mt-12 w-full">
              <button
                type="button"
                onClick={() => navigate("/account")}
                className="w-full rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background"
              >
                My account
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
