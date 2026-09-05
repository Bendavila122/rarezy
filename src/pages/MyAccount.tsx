import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { CreditCard, Heart, HelpCircle, LogOut, Settings as SettingsIcon, Ticket, Trophy } from "lucide-react";
import { DEADLINE_OPTIONS, formatDate, formatTime, money, titleOf } from "@/lib/marketplace";
import { rarezy, useRarezy, type CashDeal, type CompetitionListing, type Submission } from "@/lib/store";
import { gameById } from "@/lib/games";
import { AccountRequired } from "@/components/AccountRequired";
import { AccountLinkRow } from "@/components/AccountLinkRow";
import { auth } from "@/lib/auth";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

const STATUS_LABEL: Record<CompetitionListing["status"], string> = {
  authenticating: "In our vault — being inspected",
  live: "Live",
  closed: "Closed",
  awaiting_decision: "Needs your decision",
  partner_settled: "Sold to Rarezy",
  returned: "Returned to you",
};

export function MyAccount() {
  const { records, currentUser } = useRarezy();
  const [email, setEmail] = useState<string | null>(null);
  const playableCount = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && r.attemptsRemaining > 0,
  ).length;

  useEffect(() => {
    if (!currentUser?.id) return;
    auth.fetchProfileDetails(currentUser.id).then((d) => setEmail(d?.email ?? null));
  }, [currentUser?.id]);

  const submissions = records.filter((r): r is Submission => r.kind === "submission");
  const activeSubmissions = submissions.filter(
    (s) => s.status === "pending_review" || s.status === "offer_ready" || s.status === "visit_scheduled",
  );
  const historySubmissions = submissions
    .filter((s) => !activeSubmissions.includes(s))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const mine = records.filter(
    (r): r is CashDeal | CompetitionListing =>
      (r.kind === "cash" || r.kind === "competition") && (r.kind === "cash" || !r.isHouseStock),
  );

  if (!currentUser) {
    return (
      <AccountRequired
        title="Create an account"
        body="Sign up to see your sales, entries and payment details in one place."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">Account</h1>

      <Link to="/account/settings" className="glass-dark press mt-5 flex items-center gap-4 rounded-2xl p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.08] text-[1.1rem] font-semibold tracking-tight text-white">
          {currentUser.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            currentUser.username.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[1rem] font-semibold tracking-tight text-white">{currentUser.username}</p>
          <p className="mt-0.5 truncate text-[0.78rem] text-white/50">{email ?? "Edit your profile"}</p>
        </div>
        <SettingsIcon className="h-4 w-4 shrink-0 text-white/40" strokeWidth={1.9} />
      </Link>

      <div className="mt-5 divide-y divide-white/10 overflow-hidden rounded-2xl bg-white/[0.06]">
        <AccountLinkRow to="/entries" icon={Ticket} label="My entries" badge={playableCount} />
        <AccountLinkRow to="/wins" icon={Trophy} label="My wins" />
        <AccountLinkRow to="/watchlist" icon={Heart} label="Watchlist" />
        <AccountLinkRow to="/payments" icon={CreditCard} label="Payments & payouts" />
        <AccountLinkRow to="/help" icon={HelpCircle} label="Help centre" />
      </div>

      <button
        type="button"
        onClick={() => auth.signOut()}
        className="press mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/[0.08] py-3.5 text-[0.85rem] font-semibold tracking-tight text-red-400"
      >
        <LogOut className="h-4 w-4" strokeWidth={2.1} />
        Log out
      </button>

      {activeSubmissions.length > 0 && (
        <>
          <h2 className="mt-12 text-[1.3rem] font-semibold tracking-[-0.02em]">My submissions</h2>
          <div className="mt-6 flex flex-col gap-4">
            {activeSubmissions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="card p-6"
              >
                <SubmissionCard submission={s} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-12 text-[1.3rem] font-semibold tracking-[-0.02em]">My sales</h2>
      {mine.length === 0 ? (
        <p className="mt-6 text-[0.85rem] text-muted">
          Nothing here yet. Sell a watch and it'll show up the moment you do.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {mine.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="card p-6"
            >
              {r.kind === "cash" ? (
                <>
                  <p className={labelCls}>Instant cash — paid</p>
                  <p className="mt-3 text-[1.05rem] tracking-tight">{titleOf(r.item)}</p>
                  <p className="tabular mt-2 text-[1.4rem] font-semibold leading-none tracking-[-0.03em] text-brand">
                    {money(r.acceptedAmount)}
                  </p>
                </>
              ) : (
                <ListingCard listing={r} />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {historySubmissions.length > 0 && (
        <>
          <h2 className="mt-12 text-[1.3rem] font-semibold tracking-[-0.02em]">Offer history</h2>
          <div className="mt-6 flex flex-col gap-4">
            {historySubmissions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="card p-6 opacity-80"
              >
                <SubmissionCard submission={s} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const SUBMISSION_STATUS_LABEL: Record<Submission["status"], string> = {
  pending_review: "Under review",
  rejected: "Not approved",
  offer_ready: "Offer ready",
  visit_scheduled: "Visit booked",
  declined_by_seller: "Declined",
  visit_completed_cash: "Paid out",
  visit_completed_consignment: "Listed",
  declined_at_visit: "Declined at visit",
};

function SubmissionCard({ submission: s }: { submission: Submission }) {
  const offer = s.offer;
  const proceedCash = () => rarezy.chooseSubmissionOffer(s.id, "cash");

  return (
    <div>
      <p className={labelCls}>{SUBMISSION_STATUS_LABEL[s.status]}</p>
      <p className="mt-3 text-[1.05rem] tracking-tight">{titleOf(s.item)}</p>

      {s.status === "pending_review" && (
        <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">
          We're checking your photos, details and provenance against market data. This usually only
          takes a moment.
        </p>
      )}

      {s.status === "rejected" && (
        <>
          <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">
            {s.adminNotes || "This one didn't pass our authenticity check."}
          </p>
          <Link to="/sell" className="mt-4 inline-block text-[0.78rem] text-brand underline underline-offset-4">
            Submit something else
          </Link>
        </>
      )}

      {s.status === "offer_ready" && offer && (
        <div className="mt-5 flex flex-col gap-4">
          <div className="rounded-none border border-white/10 bg-white/[0.03] p-4">
            <p className={labelCls}>Instant cash offer</p>
            <p className="tabular mt-2 text-[1.3rem] font-semibold leading-none tracking-[-0.03em]">
              {money(offer.cashHigh)}
            </p>
            <p className="mt-2 text-[0.74rem] text-muted">
              Paid the moment our rep inspects it at your visit.
            </p>
            <button
              type="button"
              onClick={proceedCash}
              className="mt-3 w-full rounded-none border border-brand/40 py-2.5 text-[0.8rem] font-medium text-brand"
            >
              Accept cash offer
            </button>
          </div>

          <button
            type="button"
            onClick={() => rarezy.cancelSubmission(s.id)}
            className="text-[0.72rem] text-muted/60 underline underline-offset-4"
          >
            Decline both offers
          </button>
        </div>
      )}

      {s.status === "visit_scheduled" && s.visit && (
        <div className="mt-4">
          <p className="text-[0.8rem] leading-relaxed text-muted">
            A Rarezy specialist, <span className="text-foreground">{s.visit.repName}</span>, will visit
            you on{" "}
            <span className="text-foreground">
              {formatDate(s.visit.scheduledAt)} at {formatTime(s.visit.scheduledAt)}
            </span>{" "}
            to inspect it in person.
          </p>
          <p className="mt-3 text-[0.72rem] text-muted/70">
            You'll be paid in cash on the spot once they've confirmed it in person.
          </p>
        </div>
      )}

      {s.status === "visit_completed_cash" && (
        <p className="mt-4 text-[0.8rem] text-muted">
          Paid out at the visit — see it under My sales below.
        </p>
      )}

      {s.status === "visit_completed_consignment" && (
        <p className="mt-4 text-[0.8rem] text-muted">
          Collected and taken into our vault — see it under My sales below.
        </p>
      )}

      {(s.status === "declined_by_seller" || s.status === "declined_at_visit") && (
        <>
          <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">
            {s.status === "declined_at_visit"
              ? "Declined at the visit — this request is now void."
              : "You declined both offers."}
          </p>
          <Link to="/sell" className="mt-4 inline-block text-[0.78rem] text-brand underline underline-offset-4">
            Submit again
          </Link>
        </>
      )}
    </div>
  );
}

function ListingCard({ listing: c }: { listing: CompetitionListing }) {
  const raised = c.entriesSold * c.entryFee;
  const pct = Math.min(100, (raised / c.targetMax) * 100);
  const [relistDays, setRelistDays] = useState<number>(30);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={labelCls}>{STATUS_LABEL[c.status]}</p>
          <p className="mt-3 text-[1.05rem] tracking-tight">{titleOf(c.item)}</p>
          <p className="mt-1 text-[0.68rem] text-muted/60">Game: {gameById(c.gameId).name}</p>
        </div>
        {c.status === "live" && (
          <span className="tabular shrink-0 text-[0.68rem] uppercase tracking-[0.2em] text-muted">
            Ends {formatDate(c.deadlineAt)}
          </span>
        )}
      </div>

      {c.status === "authenticating" && (
        <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">
          Insured in our safe deposit vault while a specialist inspects it and prepares its
          certificate of authenticity — it'll go live the moment that's ready.
        </p>
      )}

      {(c.status === "live" || c.status === "awaiting_decision" || c.status === "closed") && (
        <>
          <p className="tabular mt-4 text-[1.4rem] font-semibold leading-none tracking-[-0.03em]">
            {money(raised)}
            <span className="ml-2 text-[0.72rem] font-normal text-muted">of up to {money(c.targetMax)}</span>
          </p>
          <div className="mt-4 h-[3px] w-full overflow-hidden rounded-none bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-none bg-brand"
            />
          </div>
          <p className="mt-3 text-[0.68rem] text-muted">
            Minimum {money(c.minimumPrice)} · {c.entriesSold.toLocaleString("en-GB")} tickets sold
          </p>
        </>
      )}

      {c.status === "closed" && (
        <p className="mt-4 text-[0.8rem] text-muted">
          Won by <span className="text-foreground">{c.winnerName}</span>
        </p>
      )}

      {c.status === "live" && (
        <button
          type="button"
          onClick={() => rarezy.previewDeadline(c.id)}
          className="mt-5 text-[0.68rem] text-muted/60 underline underline-offset-4"
        >
          Preview the deadline now (demo)
        </button>
      )}

      {c.status === "awaiting_decision" && (
        <div className="mt-6 flex flex-col gap-3">
          <p className="text-[0.78rem] leading-relaxed text-muted">
            {money(raised)} raised — under your {money(c.minimumPrice)} minimum. Take it, take a
            cash offer, relist, or have it sent back.
          </p>
          <button
            type="button"
            onClick={() => rarezy.acceptCurrentRaise(c.id)}
            className="w-full rounded-none border border-brand/40 py-3 text-[0.85rem] font-medium text-brand"
          >
            Accept {money(raised)}
          </button>
          <button
            type="button"
            onClick={() => rarezy.takePartnerOffer(c.id)}
            className="w-full rounded-none border border-brand/40 py-3 text-[0.85rem] font-medium text-brand"
          >
            Take {money(c.offer.cashHigh)} from Rarezy now
          </button>
          <div className="flex flex-wrap gap-2">
            {DEADLINE_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setRelistDays(d)}
                className={`rounded-none border px-3.5 py-2 text-[0.72rem] tracking-tight transition-all active:scale-[0.97] ${
                  relistDays === d ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => rarezy.relist(c.id, relistDays)}
            className="w-full rounded-none border border-white/10 py-3 text-[0.85rem] font-medium text-muted"
          >
            Relist for {relistDays} days — free
          </button>
          <button
            type="button"
            onClick={() => rarezy.returnItem(c.id)}
            className="text-[0.72rem] text-muted/60"
          >
            Send it back to me — I'll cover tracked, insured return shipping
          </button>
        </div>
      )}

      {c.status === "partner_settled" && (
        <p className="mt-4 text-[0.8rem] text-muted">Sold to Rarezy for {money(c.offer.cashHigh)}.</p>
      )}

      {c.status === "returned" && (
        <p className="mt-4 text-[0.8rem] text-muted">
          Every ticket was refunded, minus the non-refundable processing fee.
        </p>
      )}
    </div>
  );
}
