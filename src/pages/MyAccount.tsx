import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { CreditCard, HelpCircle, LogOut, Settings as SettingsIcon, Ticket, Trophy } from "lucide-react";
import { formatDate, formatTime, money, titleOf } from "@/lib/marketplace";
import { rarezy, useRarezy, type CompetitionListing, type Submission } from "@/lib/store";
import { AccountRequired } from "@/components/AccountRequired";
import { AccountLinkRow } from "@/components/AccountLinkRow";
import { auth } from "@/lib/auth";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

/** Most recently active first — a request that just moved to a new status should bubble up, not sit wherever it was submitted. */
const lastActivityAt = (s: Submission) => s.history[s.history.length - 1]?.at ?? s.submittedAt;

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

  const submissions = records
    .filter((r): r is Submission => r.kind === "submission")
    .sort((a, b) => new Date(lastActivityAt(b)).getTime() - new Date(lastActivityAt(a)).getTime());

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

      <h2 className="mt-12 text-[1.3rem] font-semibold tracking-[-0.02em]">Sell requests</h2>
      {submissions.length === 0 ? (
        <p className="mt-6 text-[0.85rem] text-muted">
          Nothing here yet.{" "}
          <Link to="/sell" className="text-brand underline underline-offset-4">
            Sell a watch
          </Link>{" "}
          and it'll show up the moment you do.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {submissions.map((s, i) => (
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
  declined_at_visit: "Declined at visit",
};

function SubmissionCard({ submission: s }: { submission: Submission }) {
  const offer = s.offer;
  const proceedCash = () => rarezy.chooseSubmissionOffer(s.id);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={labelCls}>{SUBMISSION_STATUS_LABEL[s.status]}</p>
          <p className="mt-3 text-[1.05rem] tracking-tight">{titleOf(s.item)}</p>
        </div>
        {offer && (
          <p className="tabular shrink-0 text-right text-[0.92rem] font-semibold text-brand">
            {money(offer.cashLow)}–{money(offer.cashHigh)}
          </p>
        )}
      </div>

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
        <p className="mt-4 text-[0.8rem] text-muted">Paid out at the visit.</p>
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

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className={labelCls}>Timeline</p>
        <div className="mt-3 flex flex-col gap-3">
          {s.history.map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <div>
                <p className="text-[0.78rem] leading-snug text-foreground">{h.label}</p>
                <p className="text-[0.66rem] text-muted">
                  {formatDate(h.at)} · {formatTime(h.at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

