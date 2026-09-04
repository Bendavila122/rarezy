import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRarezy } from "@/lib/store";
import { AccountRequired } from "@/components/AccountRequired";
import { marketDb, type DisputeType, type Fulfilment, type MarketCompetition } from "@/lib/db";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

const FULFILMENT_STATUS_LABEL: Record<Fulfilment["status"], string> = {
  pending: "The seller is preparing to ship this",
  preparing: "The seller is preparing to ship this",
  dispatched: "Dispatched",
  delivered: "Delivered",
  confirmed: "Delivered",
};

const DISPUTE_TYPES: { id: DisputeType; label: string }[] = [
  { id: "not_received", label: "Never arrived" },
  { id: "materially_different", label: "Not what was listed" },
  { id: "damaged", label: "Arrived damaged" },
  { id: "wrong_product", label: "Wrong item entirely" },
  { id: "other", label: "Something else" },
];

function WinCard({ c, userId }: { c: MarketCompetition; userId: string }) {
  const [fulfilment, setFulfilment] = useState<Fulfilment | null | undefined>(undefined);
  const [reporting, setReporting] = useState(false);
  const [disputeType, setDisputeType] = useState<DisputeType>("not_received");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    marketDb.fetchFulfilment(c.id).then(setFulfilment);
  }, [c.id]);

  const submitDispute = async () => {
    if (!description.trim()) return;
    setBusy(true);
    try {
      await marketDb.openDispute({
        competitionId: c.id,
        userId,
        sellerId: c.sellerId,
        type: disputeType,
        description: description.trim(),
      });
      setSubmitted(true);
      setReporting(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-5">
      <p className={labelCls}>You won</p>
      <p className="mt-2 text-[1.05rem] tracking-tight">
        {c.product.brand} {c.product.model}
      </p>
      <p className="mt-1 text-[0.78rem] text-muted">Sold by {c.seller.businessName}</p>

      <p className="mt-4 text-[0.8rem] text-foreground">
        {fulfilment ? FULFILMENT_STATUS_LABEL[fulfilment.status] : "The seller is preparing to ship this"}
      </p>
      {fulfilment?.trackingNumber && (
        <p className="mt-1 text-[0.76rem] text-muted">
          {fulfilment.carrier} · {fulfilment.trackingNumber}
        </p>
      )}

      {!submitted && !reporting && (
        <button
          type="button"
          onClick={() => setReporting(true)}
          className="mt-4 text-[0.76rem] text-muted underline underline-offset-4"
        >
          Report an issue
        </button>
      )}

      {submitted && <p className="mt-4 text-[0.76rem] text-brand">Reported — Rarezy will be in touch.</p>}

      {reporting && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-2">
            {DISPUTE_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setDisputeType(t.id)}
                className={`rounded-none border px-3 py-1.5 text-[0.74rem] tracking-tight transition-all active:scale-[0.97] ${
                  disputeType === t.id ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What went wrong?"
            className="mt-3 w-full rounded-none border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[0.82rem] text-foreground outline-none focus:border-brand/40"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={submitDispute}
              disabled={!description.trim() || busy}
              className="flex-1 rounded-none bg-brand py-2.5 text-[0.8rem] font-medium tracking-tight text-background disabled:opacity-30"
            >
              {busy ? "Submitting…" : "Submit report"}
            </button>
            <button
              type="button"
              onClick={() => setReporting(false)}
              className="rounded-none border border-white/10 px-4 py-2.5 text-[0.8rem] text-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MyWins() {
  const { currentUser } = useRarezy();
  const [wins, setWins] = useState<MarketCompetition[]>([]);

  useEffect(() => {
    if (!currentUser?.id) return;
    marketDb.fetchMyWins(currentUser.id).then(setWins);
  }, [currentUser?.id]);

  if (!currentUser) {
    return <AccountRequired title="Create an account" body="Sign in to see anything you've won." />;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">My wins</h1>
      <p className="mt-2 text-[0.85rem] text-muted">Everything you've won from Rarezy's verified sellers.</p>

      {wins.length === 0 ? (
        <p className="mt-14 text-center text-[0.9rem] text-muted">
          Nothing yet.{" "}
          <Link to="/browse" className="text-brand underline underline-offset-4">
            Browse competitions
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {wins.map((c) => (
            <WinCard key={c.id} c={c} userId={currentUser.id!} />
          ))}
        </div>
      )}
    </div>
  );
}
