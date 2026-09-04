import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DEADLINE_OPTIONS,
  estimateValue,
  formatDate,
  formatTime,
  money,
  roundTo,
  titleOf,
  type AnalysisFinding,
} from "@/lib/marketplace";
import { rarezy, useRarezy, type CompetitionListing, type Submission } from "@/lib/store";
import { CertificateOfAuthenticity } from "@/components/CertificateOfAuthenticity";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";
const fieldCls =
  "mt-1.5 w-full rounded-none border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[0.85rem] tracking-tight text-foreground outline-none focus:border-brand/40";

const SUBMISSION_STATUS_LABEL: Record<Submission["status"], string> = {
  pending_review: "Pending review",
  rejected: "Rejected",
  offer_ready: "Offer sent — awaiting seller",
  visit_scheduled: "Visit scheduled",
  declined_by_seller: "Declined by seller",
  visit_completed_cash: "Paid out",
  visit_completed_consignment: "Consigned",
  declined_at_visit: "Declined at visit",
};

const CHECKLIST_LABELS = [
  "Case & crystal",
  "Bezel",
  "Dial & hands",
  "Movement & timekeeping",
  "Bracelet / strap",
  "Engraving & serial match",
  "Box & papers",
];

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className={labelCls}>{label}</p>
      <p className="tabular mt-2 text-[1.6rem] font-semibold leading-none tracking-[-0.03em]">{value}</p>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className={labelCls}>{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        inputMode="decimal"
        className={fieldCls}
      />
    </div>
  );
}

export function Admin() {
  const { records, currentUser } = useRarezy();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!currentUser?.isAdmin) {
    return (
      <div className="mx-auto max-w-sm px-6 py-24 text-center">
        <h1 className="text-[1.3rem] font-semibold tracking-[-0.02em]">Admin access only</h1>
        <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
          Sign in with the admin account to see the review queue.
        </p>
      </div>
    );
  }

  const submissions = records
    .filter((r): r is Submission => r.kind === "submission")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const listings = records.filter((r): r is CompetitionListing => r.kind === "competition");

  const pendingCount = submissions.filter((s) => s.status === "pending_review").length;
  const offerReadyCount = submissions.filter((s) => s.status === "offer_ready").length;
  const visitScheduledCount = submissions.filter((s) => s.status === "visit_scheduled").length;
  const vaultCount = listings.filter((c) => c.status === "authenticating").length;

  const selected = submissions.find((s) => s.id === selectedId) ?? submissions[0] ?? null;
  const selectedListing = selected?.resultRecordId
    ? listings.find((c) => c.id === selected.resultRecordId)
    : undefined;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">Admin</h1>
      <p className="mt-2 text-[0.85rem] text-muted">Review queue for everything coming in through Sell.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Pending review" value={pendingCount} />
        <StatTile label="Offers awaiting seller" value={offerReadyCount} />
        <StatTile label="Visits scheduled" value={visitScheduledCount} />
        <StatTile label="Vault — needs certificate" value={vaultCount} />
      </div>

      {submissions.length === 0 ? (
        <p className="mt-14 text-center text-[0.9rem] text-muted">Nothing submitted yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="flex flex-col gap-2">
            {submissions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`press rounded-none border p-4 text-left transition-colors ${
                  selected?.id === s.id ? "border-brand/40 bg-brand/10" : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-brand">
                  {SUBMISSION_STATUS_LABEL[s.status]}
                </p>
                <p className="mt-2 text-[0.9rem] tracking-tight">{titleOf(s.item)}</p>
                <p className="mt-1 text-[0.7rem] text-muted">{formatDate(s.submittedAt)}</p>
              </button>
            ))}
          </div>

          <div className="card p-6">
            {selected && <SubmissionDetail key={selected.id} submission={selected} listing={selectedListing} />}
          </div>
        </div>
      )}
    </div>
  );
}

function SubmissionDetail({
  submission: s,
  listing,
}: {
  submission: Submission;
  listing?: CompetitionListing | undefined;
}) {
  const item = s.item;
  const photos = item.photos ?? [];

  return (
    <div>
      <p className={labelCls}>{SUBMISSION_STATUS_LABEL[s.status]}</p>
      <h2 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.02em]">{titleOf(item)}</h2>

      {photos.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {photos.map((p) => (
            <img key={p} src={p} alt="" className="h-20 w-20 rounded-none border border-white/10 object-cover" />
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.8rem]">
        <p className="text-muted">
          Condition <span className="text-foreground">{item.condition}</span>
        </p>
        <p className="text-muted">
          Year <span className="text-foreground">{item.year}</span>
        </p>
        <p className="text-muted">
          Paid <span className="text-foreground">{money(item.purchasePrice)}</span>
        </p>
        <p className="text-muted">
          Bought from <span className="text-foreground">{item.purchasedFrom || "Not given"}</span>
        </p>
      </div>
      {item.description && <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">{item.description}</p>}

      {s.status === "pending_review" && <ReviewForm submission={s} />}
      {s.status === "visit_scheduled" && <CompleteVisitForm submission={s} />}
      {s.status === "visit_completed_consignment" && listing && !listing.analysisReport && (
        <CertificateForm submission={s} listing={listing} />
      )}
      {s.status === "visit_completed_consignment" && listing?.analysisReport && (
        <div className="mt-8">
          <p className={labelCls}>Certificate published</p>
          <Link
            to={`/certificate/${listing.id}`}
            className="mt-2 inline-block text-[0.8rem] text-brand underline underline-offset-4"
          >
            View certificate
          </Link>
        </div>
      )}

      {(s.status === "rejected" ||
        s.status === "declined_by_seller" ||
        s.status === "declined_at_visit" ||
        s.status === "offer_ready" ||
        s.status === "visit_completed_cash") && (
        <div className="mt-8">
          {s.adminNotes && <p className="text-[0.8rem] leading-relaxed text-muted">{s.adminNotes}</p>}
          {s.offer && s.status === "offer_ready" && (
            <p className="mt-2 text-[0.78rem] text-muted">
              Cash {money(s.offer.cashLow)}–{money(s.offer.cashHigh)} · Ceiling {money(s.offer.ceiling)} ·
              Minimum {money(s.offer.suggestedMinimum)} — waiting on the seller's dashboard.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 border-t border-white/[0.08] pt-4">
        <p className={labelCls}>History</p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {s.history.map((h, i) => (
            <li key={i} className="text-[0.74rem] text-muted">
              <span className="text-foreground/80">{formatDate(h.at)}</span> — {h.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ReviewForm({ submission: s }: { submission: Submission }) {
  const baseline = estimateValue(s.item);
  // The stated rule is "tickets raise at most ~20% over what the seller
  // paid" — default the ceiling there, but never below the cash offer
  // itself (a high-prestige brand's baseline cash offer can otherwise
  // exceed a flat 20%-over-purchase-price cap).
  const ceilingCap = roundTo(s.item.purchasePrice * 1.2);
  const ceilingDefault = Math.max(ceilingCap, baseline.cashHigh + 50);

  const [adminNotes, setAdminNotes] = useState(
    "Images and provided details are consistent with a genuine piece; proceeding to offer.",
  );
  const [cashLow, setCashLow] = useState(String(baseline.cashLow));
  const [cashHigh, setCashHigh] = useState(String(baseline.cashHigh));
  const [suggestedMinimum, setSuggestedMinimum] = useState(String(baseline.cashHigh));
  const [ceiling, setCeiling] = useState(String(ceilingDefault));
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const approve = () => {
    rarezy.adminApproveSubmission(s.id, {
      adminNotes,
      cashLow: Number(cashLow) || 0,
      cashHigh: Number(cashHigh) || 0,
      suggestedMinimum: Number(suggestedMinimum) || 0,
      ceiling: Number(ceiling) || 0,
    });
  };

  const reject = () => {
    rarezy.adminRejectSubmission(s.id, rejectNotes || "This one didn't pass our authenticity check.");
  };

  return (
    <div className="mt-8 border-t border-white/[0.08] pt-6">
      <p className={labelCls}>Review</p>

      {!rejecting ? (
        <>
          <p className={`${labelCls} mt-4`}>Notes</p>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={2}
            className={`${fieldCls} resize-none`}
          />

          <div className="mt-4 grid grid-cols-2 gap-4">
            <NumberField label="Cash — low" value={cashLow} onChange={setCashLow} />
            <NumberField label="Cash — high" value={cashHigh} onChange={setCashHigh} />
            <NumberField label="Ticket minimum" value={suggestedMinimum} onChange={setSuggestedMinimum} />
            <NumberField label="Ticket ceiling" value={ceiling} onChange={setCeiling} />
          </div>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={approve}
              className="flex-1 rounded-none bg-brand py-3 text-[0.85rem] font-medium tracking-tight text-background"
            >
              Approve — send offer
            </button>
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="rounded-none border border-white/10 px-4 py-3 text-[0.85rem] text-muted"
            >
              Reject
            </button>
          </div>
        </>
      ) : (
        <>
          <p className={`${labelCls} mt-4`}>Reason for rejecting</p>
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            rows={3}
            placeholder="Photos don't match the stated reference, provenance doesn't check out…"
            className={`${fieldCls} resize-none`}
          />
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={reject}
              className="flex-1 rounded-none border border-red-500/40 py-3 text-[0.85rem] font-medium text-red-400"
            >
              Confirm reject
            </button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="rounded-none border border-white/10 px-4 py-3 text-[0.85rem] text-muted"
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CompleteVisitForm({ submission: s }: { submission: Submission }) {
  const offer = s.offer!;
  const [outcome, setOutcome] = useState<"cash" | "consignment" | "declined">(s.sellerChoice ?? "cash");
  const [finalCashAmount, setFinalCashAmount] = useState(String(offer.cashHigh));
  const [finalEntryFee, setFinalEntryFee] = useState(s.proposedEntryFee ?? 2);
  const [finalMinimumPrice, setFinalMinimumPrice] = useState(
    String(s.proposedMinimumPrice ?? offer.suggestedMinimum),
  );
  const [finalDeadlineDays, setFinalDeadlineDays] = useState(s.proposedDeadlineDays ?? 30);

  const complete = () => {
    rarezy.adminCompleteVisit(s.id, outcome, {
      finalCashAmount: Number(finalCashAmount) || undefined,
      finalEntryFee,
      finalMinimumPrice: Number(finalMinimumPrice) || undefined,
      finalDeadlineDays,
    });
  };

  return (
    <div className="mt-8 border-t border-white/[0.08] pt-6">
      <p className={labelCls}>Visit</p>
      {s.visit && (
        <p className="mt-2 text-[0.8rem] text-muted">
          {s.visit.repName} · {formatDate(s.visit.scheduledAt)} at {formatTime(s.visit.scheduledAt)} · seller
          leaned toward <span className="text-foreground">{s.sellerChoice}</span>
        </p>
      )}

      <p className={`${labelCls} mt-5`}>Outcome — decided on the spot</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["cash", "consignment", "declined"] as const).map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setOutcome(o)}
            className={`rounded-none border px-3.5 py-2 text-[0.78rem] tracking-tight transition-all active:scale-[0.97] ${
              outcome === o ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
            }`}
          >
            {o === "cash" ? "Instant cash" : o === "consignment" ? "Consign" : "Declined"}
          </button>
        ))}
      </div>

      {outcome === "cash" && (
        <div className="mt-4">
          <NumberField label="Final cash amount" value={finalCashAmount} onChange={setFinalCashAmount} />
        </div>
      )}

      {outcome === "consignment" && (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <p className={labelCls}>Ticket price</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {[1, 2, 5, 10, 25, 50].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFinalEntryFee(v)}
                  className={`rounded-none border px-3.5 py-2 text-[0.76rem] tracking-tight transition-all active:scale-[0.97] ${
                    finalEntryFee === v ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
                  }`}
                >
                  {money(v)}
                </button>
              ))}
            </div>
          </div>
          <NumberField label="Minimum accepted" value={finalMinimumPrice} onChange={setFinalMinimumPrice} />
          <div>
            <p className={labelCls}>Deadline</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {DEADLINE_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFinalDeadlineDays(d)}
                  className={`rounded-none border px-3.5 py-2 text-[0.76rem] tracking-tight transition-all active:scale-[0.97] ${
                    finalDeadlineDays === d ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {outcome === "declined" && (
        <p className="mt-4 text-[0.78rem] text-muted">
          Rep leaves — nothing paid, nothing listed. Void; the seller would need to resubmit.
        </p>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={complete}
          className="w-full rounded-none bg-brand py-3 text-[0.85rem] font-medium tracking-tight text-background"
        >
          Complete visit
        </button>
      </div>
    </div>
  );
}

function CertificateForm({ submission: s, listing }: { submission: Submission; listing: CompetitionListing }) {
  const [inspectorName] = useState(() => s.visit?.repName ?? "Rarezy specialist");
  const [summary, setSummary] = useState(
    `${titleOf(s.item)} was inspected in person and found consistent with a genuine example — see the checklist below.`,
  );
  const [findings, setFindings] = useState<AnalysisFinding[]>(() =>
    CHECKLIST_LABELS.map((label) => ({ label, note: "No issues found", flagged: false })),
  );

  const toggleFlag = (label: string) =>
    setFindings((prev) => prev.map((f) => (f.label === label ? { ...f, flagged: !f.flagged } : f)));
  const setNote = (label: string, note: string) =>
    setFindings((prev) => prev.map((f) => (f.label === label ? { ...f, note } : f)));

  const publish = () => rarezy.adminPublishAnalysisReport(listing.id, { inspectorName, summary, findings });

  return (
    <div className="mt-8 border-t border-white/[0.08] pt-6">
      <p className={labelCls}>Certificate of authenticity</p>

      <p className={`${labelCls} mt-4`}>Inspector</p>
      <p className="mt-1.5 text-[0.85rem] text-foreground">{inspectorName}</p>

      <p className={`${labelCls} mt-4`}>Summary</p>
      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={3}
        className={`${fieldCls} resize-none`}
      />

      <p className={`${labelCls} mt-5`}>Inspection checklist</p>
      <div className="mt-2 flex flex-col gap-2">
        {findings.map((f) => (
          <div key={f.label} className="rounded-none border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.8rem] text-foreground">{f.label}</p>
              <button
                type="button"
                onClick={() => toggleFlag(f.label)}
                className={`shrink-0 rounded-none border px-2.5 py-1 text-[0.68rem] font-medium tracking-tight ${
                  f.flagged ? "border-red-500/40 bg-red-500/10 text-red-400" : "border-brand/40 bg-brand/10 text-brand"
                }`}
              >
                {f.flagged ? "Flagged" : "Pass"}
              </button>
            </div>
            <input
              value={f.note}
              onChange={(e) => setNote(f.label, e.target.value)}
              className="mt-2 w-full rounded-none border-none bg-transparent text-[0.76rem] text-muted outline-none"
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <p className={labelCls}>Preview</p>
        <div className="mt-3">
          <CertificateOfAuthenticity
            item={s.item}
            report={{
              certificateId: "PREVIEW",
              generatedAt: new Date().toISOString(),
              inspectorName,
              summary,
              findings,
            }}
            compact
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={publish}
          className="w-full rounded-none bg-brand py-3 text-[0.85rem] font-medium tracking-tight text-background"
        >
          Publish certificate — go live
        </button>
      </div>
    </div>
  );
}
