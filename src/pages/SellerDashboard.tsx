import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useRarezy } from "@/lib/store";
import { AccountRequired } from "@/components/AccountRequired";
import { marketDb, moneyFromPence, type MarketCompetition, type Seller } from "@/lib/db";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";
const inputCls =
  "mt-2 w-full rounded-none border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[16px] tracking-tight text-foreground outline-none placeholder:text-muted/60 focus:border-brand/40";

const COMPETITION_STATUS_LABEL: Record<MarketCompetition["status"], string> = {
  draft: "Draft",
  pending_approval: "Awaiting Rarezy approval",
  live: "Live",
  completed: "Sold out",
  winner_pending: "Winner pending",
  fulfilment_pending: "Awaiting fulfilment",
  fulfilled: "Fulfilled",
  payout_pending: "Payout pending",
  paid: "Paid out",
  cancelled: "Cancelled",
  refunded: "Refunded",
  rejected: "Rejected",
};

function ApplicationForm({ ownerId, onApplied }: { ownerId: string; onApplied: (s: Seller) => void }) {
  const [businessName, setBusinessName] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [category, setCategory] = useState<Seller["category"]>("watches");
  const [yearsTrading, setYearsTrading] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactEmail.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const seller = await marketDb.applyAsSeller({
        ownerId,
        businessName: businessName.trim(),
        tradingName: tradingName.trim() || undefined,
        country: "GB",
        website: website.trim() || undefined,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || undefined,
        category,
        yearsTrading: yearsTrading ? Number(yearsTrading) : undefined,
      });
      onApplied(seller);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit your application.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">Become a Rarezy seller</h1>
      <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
        Turn your luxury stock into competitions and reach Rarezy's customers. Your stock, your
        competition, your customers — Rarezy provides the marketplace, the technology and the
        customers. Once approved, you'll set your own ticket price, maximum entries and deadline for
        every competition you list.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <div>
          <label className={labelCls}>Business name</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="ABC Jewellers" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Trading name · optional</label>
          <input value={tradingName} onChange={(e) => setTradingName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Seller["category"])}
            className={`${inputCls} bg-background`}
          >
            <option value="watches">Watches</option>
            <option value="jewellery">Jewellery</option>
            <option value="other">Other luxury goods</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Business website · optional</label>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Contact email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="you@business.com"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Contact phone · optional</label>
          <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Years trading · optional</label>
          <input
            value={yearsTrading}
            onChange={(e) => setYearsTrading(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            className={inputCls}
          />
        </div>

        {error && <p className="text-[0.78rem] text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={!businessName.trim() || !contactEmail.trim() || busy}
          className="mt-4 w-full rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background disabled:opacity-30"
        >
          {busy ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}

function CompetitionRow({ c }: { c: MarketCompetition }) {
  const pct = Math.min(100, Math.round((c.entriesSold / c.maxEntries) * 100));
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={labelCls}>{COMPETITION_STATUS_LABEL[c.status]}</p>
          <p className="mt-2 text-[1rem] tracking-tight">
            {c.product.brand} {c.product.model}
          </p>
        </div>
        <span className="tabular shrink-0 text-[0.72rem] text-muted">{moneyFromPence(c.ticketPricePence)}/ticket</span>
      </div>
      <div className="mt-3 h-[3px] w-full overflow-hidden rounded-none bg-white/10">
        <div className="h-full rounded-none bg-brand" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[0.72rem] text-muted">
        {c.entriesSold.toLocaleString("en-GB")}/{c.maxEntries.toLocaleString("en-GB")} entries ·{" "}
        {moneyFromPence(c.entriesSold * c.ticketPricePence)} raised
      </p>
    </div>
  );
}

export function SellerDashboard() {
  const { currentUser } = useRarezy();
  const [seller, setSeller] = useState<Seller | null | undefined>(undefined);
  const [competitions, setCompetitions] = useState<MarketCompetition[]>([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    marketDb.fetchMySeller(currentUser.id).then(setSeller);
  }, [currentUser?.id]);

  useEffect(() => {
    if (!seller || seller.status !== "approved") return;
    marketDb.fetchMyCompetitions(seller.id).then(setCompetitions);
  }, [seller]);

  if (!currentUser) {
    return (
      <AccountRequired
        title="Create an account to sell with us"
        body="Sign up so we know where to send your seller application."
      />
    );
  }

  if (seller === undefined) return null;

  if (!seller) {
    return <ApplicationForm ownerId={currentUser.id!} onApplied={setSeller} />;
  }

  if (seller.status === "submitted" || seller.status === "under_review") {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className={labelCls}>Application received</p>
        <h1 className="mt-3 text-[1.6rem] font-semibold tracking-[-0.02em]">We're reviewing {seller.businessName}</h1>
        <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
          You'll be able to create your first competition as soon as Rarezy approves your application.
        </p>
      </div>
    );
  }

  if (seller.status === "rejected") {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className={labelCls}>Application not approved</p>
        <h1 className="mt-3 text-[1.6rem] font-semibold tracking-[-0.02em]">This one didn't go through</h1>
        {seller.adminNotes && <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">{seller.adminNotes}</p>}
        <p className="mt-3 text-[0.8rem] text-muted">Get in touch if you'd like to discuss and reapply.</p>
      </div>
    );
  }

  if (seller.status === "suspended" || seller.status === "banned") {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className={labelCls}>Account {seller.status}</p>
        <h1 className="mt-3 text-[1.6rem] font-semibold tracking-[-0.02em]">{seller.businessName}</h1>
        <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
          Contact Rarezy support for more information.
        </p>
      </div>
    );
  }

  const live = competitions.filter((c) => c.status === "live");
  const totalRaisedPence = competitions.reduce((sum, c) => sum + c.entriesSold * c.ticketPricePence, 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={labelCls}>Verified seller</p>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.03em]">{seller.businessName}</h1>
        </div>
        <Link
          to="/seller/new"
          className="press shrink-0 rounded-none bg-brand px-4 py-2.5 text-[0.8rem] font-medium tracking-tight text-background"
        >
          Create competition
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="card p-4">
          <p className={labelCls}>Live</p>
          <p className="tabular mt-2 text-[1.4rem] font-semibold leading-none">{live.length}</p>
        </div>
        <div className="card p-4">
          <p className={labelCls}>Total competitions</p>
          <p className="tabular mt-2 text-[1.4rem] font-semibold leading-none">{competitions.length}</p>
        </div>
        <div className="card p-4">
          <p className={labelCls}>Raised (gross)</p>
          <p className="tabular mt-2 text-[1.4rem] font-semibold leading-none">{moneyFromPence(totalRaisedPence)}</p>
        </div>
      </div>

      <h2 className="mt-10 text-[1.2rem] font-semibold tracking-[-0.02em]">Your competitions</h2>
      {competitions.length === 0 ? (
        <p className="mt-6 text-[0.85rem] text-muted">
          Nothing yet.{" "}
          <Link to="/seller/new" className="text-brand underline underline-offset-4">
            Create your first competition
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {competitions.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <CompetitionRow c={c} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
