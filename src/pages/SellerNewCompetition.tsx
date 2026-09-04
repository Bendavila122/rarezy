import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X } from "lucide-react";
import { useRarezy } from "@/lib/store";
import { AccountRequired } from "@/components/AccountRequired";
import { marketDb, type Product, type Seller } from "@/lib/db";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";
const inputCls =
  "mt-2 w-full rounded-none border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[16px] tracking-tight text-foreground outline-none placeholder:text-muted/60 focus:border-brand/40";

const CATEGORIES: Product["category"][] = ["watch", "jewellery", "handbag", "clothing", "electronics", "other"];
const CONDITIONS: Product["condition"][] = ["new", "excellent", "good", "fair"];

export function SellerNewCompetition() {
  const { currentUser } = useRarezy();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null | undefined>(undefined);

  useEffect(() => {
    if (!currentUser?.id) return;
    marketDb.fetchMySeller(currentUser.id).then(setSeller);
  }, [currentUser?.id]);

  const [category, setCategory] = useState<Product["category"]>("watch");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [reference, setReference] = useState("");
  const [year, setYear] = useState("");
  const [condition, setCondition] = useState<Product["condition"]>("excellent");
  const [retailValue, setRetailValue] = useState("");
  const [description, setDescription] = useState("");
  const [box, setBox] = useState(false);
  const [papers, setPapers] = useState(false);
  const [accessories, setAccessories] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [ticketPrice, setTicketPrice] = useState("2");
  const [maxEntries, setMaxEntries] = useState("5000");
  const [deadlineDays, setDeadlineDays] = useState("30");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list).slice(0, 10 - files.length);
    setFiles((prev) => [...prev, ...next]);
    setPreviews((prev) => [...prev, ...next.map((f) => URL.createObjectURL(f))]);
  };
  const removeFile = (i: number) => {
    URL.revokeObjectURL(previews[i]!);
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  if (!currentUser) {
    return <AccountRequired title="Create an account to sell with us" body="Sign in to create a competition." />;
  }
  if (seller === undefined) return null;
  if (!seller || seller.status !== "approved") {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-[1.4rem] font-semibold tracking-[-0.02em]">Approved sellers only</h1>
        <p className="mt-3 text-[0.85rem] text-muted">You need an approved seller account to create a competition.</p>
      </div>
    );
  }

  const valid =
    brand.trim() &&
    model.trim() &&
    description.trim().length >= 20 &&
    Number(retailValue) > 0 &&
    files.length >= 3 &&
    Number(ticketPrice) > 0 &&
    Number(maxEntries) > 0;

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const product = await marketDb.createProduct(seller.id, {
        category,
        brand: brand.trim(),
        model: model.trim(),
        reference: reference.trim() || null,
        year: year ? Number(year) : null,
        condition,
        retailValuePence: Math.round(Number(retailValue) * 100),
        description: description.trim(),
        box,
        papers,
        accessories: accessories.trim() || null,
      });

      for (let i = 0; i < files.length; i++) {
        await marketDb.uploadProductImage(seller.id, product.id, files[i]!, i);
      }
      await marketDb.submitProductForApproval(product.id);

      const endsAt = new Date(Date.now() + Number(deadlineDays) * 86_400_000).toISOString();
      const competitionId = await marketDb.createCompetition(seller.id, {
        productId: product.id,
        ticketPricePence: Math.round(Number(ticketPrice) * 100),
        maxEntries: Number(maxEntries),
        endsAt,
      });
      await marketDb.submitCompetitionForApproval(competitionId);

      navigate("/seller");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit this competition.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">Create a competition</h1>
      <p className="mt-2 text-[0.85rem] text-muted">
        Submitted for Rarezy's review before it goes live — nothing you set here can go public without approval.
      </p>

      <p className={`${labelCls} mt-9`}>Category</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-none border px-4 py-2.5 text-[0.8rem] capitalize tracking-tight transition-all active:scale-[0.97] ${
              category === c ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Brand</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Rolex" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Model</label>
          <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Submariner Date" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Reference · optional</label>
          <input value={reference} onChange={(e) => setReference(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Year · optional</label>
          <input value={year} onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} inputMode="numeric" className={inputCls} />
        </div>
      </div>

      <p className={`${labelCls} mt-8`}>Condition</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CONDITIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCondition(c)}
            className={`rounded-none border px-4 py-2.5 text-[0.8rem] capitalize tracking-tight transition-all active:scale-[0.97] ${
              condition === c ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className={`${labelCls} mt-8`}>Retail / reference value (£)</p>
      <input
        value={retailValue}
        onChange={(e) => setRetailValue(e.target.value.replace(/[^0-9.]/g, ""))}
        inputMode="decimal"
        placeholder="10000"
        className={inputCls}
      />

      <p className={`${labelCls} mt-8`}>Full description</p>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        placeholder="Everything a winner needs to know — condition, any marks or wear, service history, what's included. Disclose anything that could materially affect how this piece is understood."
        className={`${inputCls} resize-none`}
      />

      <div className="mt-6 flex gap-6">
        <label className="flex items-center gap-2 text-[0.82rem] text-foreground">
          <input type="checkbox" checked={box} onChange={(e) => setBox(e.target.checked)} className="h-4 w-4" />
          Original box
        </label>
        <label className="flex items-center gap-2 text-[0.82rem] text-foreground">
          <input type="checkbox" checked={papers} onChange={(e) => setPapers(e.target.checked)} className="h-4 w-4" />
          Original papers
        </label>
      </div>

      <p className={`${labelCls} mt-6`}>Other accessories · optional</p>
      <input value={accessories} onChange={(e) => setAccessories(e.target.value)} className={inputCls} />

      <p className={`${labelCls} mt-9`}>Images — at least 3</p>
      <p className="mt-1 text-[0.72rem] text-muted/70">
        Clear, high-resolution images that accurately represent the exact piece the winner will receive.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {previews.map((url, i) => (
          <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-none border border-white/10">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeFile(i)}
              aria-label="Remove photo"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-none bg-black/60 text-white"
            >
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          </div>
        ))}
        {files.length < 10 && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-none border border-dashed border-white/15 bg-white/[0.04] text-muted transition-colors hover:border-brand/40 hover:text-brand">
            <ImagePlus className="h-5 w-5" strokeWidth={1.6} />
            <span className="text-[0.6rem] tracking-tight">Add</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </label>
        )}
      </div>

      <h2 className="mt-10 text-[1.2rem] font-semibold tracking-[-0.02em]">Competition terms</h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Ticket price (£)</label>
          <input value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Maximum entries</label>
          <input value={maxEntries} onChange={(e) => setMaxEntries(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" className={inputCls} />
        </div>
      </div>
      <p className="mt-2 text-[0.72rem] text-muted/70">
        {maxEntries && ticketPrice
          ? `${Number(maxEntries).toLocaleString("en-GB")} entries at £${ticketPrice} raises up to £${(Number(maxEntries) * Number(ticketPrice)).toLocaleString("en-GB")} before Rarezy's platform fee.`
          : "Choose your own maximum — subject to Rarezy's approval."}
      </p>

      <p className={`${labelCls} mt-6`}>Closing in</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[7, 14, 30, 45, 60].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDeadlineDays(String(d))}
            className={`rounded-none border px-4 py-2.5 text-[0.8rem] tracking-tight transition-all active:scale-[0.97] ${
              deadlineDays === String(d) ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      <p className="mt-8 text-[0.76rem] leading-relaxed text-muted">
        By submitting, you confirm the information supplied is accurate and that you're able to fulfil this prize
        as described — shipping it directly to the winner once the competition completes.
      </p>

      {error && <p className="mt-4 text-[0.78rem] text-red-400">{error}</p>}

      <div className="mt-6">
        <button
          type="button"
          onClick={submit}
          disabled={!valid || busy}
          className="w-full rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background disabled:opacity-30"
        >
          {busy ? "Submitting…" : "Submit for approval"}
        </button>
      </div>
    </div>
  );
}
