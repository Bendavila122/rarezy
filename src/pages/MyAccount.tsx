import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useState } from "react";
import { DEADLINE_OPTIONS, formatDate, money, titleOf } from "@/lib/marketplace";
import { rarezy, useRarezy, type CompetitionListing } from "@/lib/store";
import { AccountRequired } from "@/components/AccountRequired";
import { auth } from "@/lib/auth";

const quickLinkCls =
  "rounded-none border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.78rem] tracking-tight text-muted transition-all active:scale-[0.97]";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

const STATUS_LABEL: Record<CompetitionListing["status"], string> = {
  authenticating: "Being authenticated",
  live: "Live",
  closed: "Closed",
  awaiting_decision: "Needs your decision",
  partner_settled: "Sold to partner watch specialist",
  returned: "Returned to you",
};

export function MyAccount() {
  const { records, currentUser } = useRarezy();
  const mine = records.filter((r) => r.kind === "cash" || !r.isHouseStock);

  if (!currentUser) {
    return (
      <AccountRequired
        title="Create an account"
        body="Sign up to see your listings, entries and payment details in one place."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">Account</h1>
        <button
          type="button"
          onClick={() => auth.signOut()}
          className="mt-2 text-[0.72rem] text-muted/60 underline underline-offset-4"
        >
          Log out
        </button>
      </div>
      <p className="mt-1 text-[0.85rem] text-muted">Signed in as {currentUser.username}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link to="/entries" className={quickLinkCls}>
          My entries
        </Link>
        <Link to="/watchlist" className={quickLinkCls}>
          Watchlist
        </Link>
        <Link to="/payments" className={quickLinkCls}>
          Payments &amp; payouts
        </Link>
        <Link to="/help" className={quickLinkCls}>
          Help centre
        </Link>
      </div>

      <h2 className="mt-12 text-[1.3rem] font-semibold tracking-[-0.02em]">My listings</h2>
      {mine.length === 0 ? (
        <p className="mt-6 text-[0.85rem] text-muted">
          Nothing here yet. List a watch and it'll show up the moment you do.
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
        </div>
        {c.status === "live" && (
          <span className="tabular shrink-0 text-[0.68rem] uppercase tracking-[0.2em] text-muted">
            Ends {formatDate(c.deadlineAt)}
          </span>
        )}
      </div>

      {c.status === "authenticating" && (
        <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">
          With our partner watch specialist now — checked, certified and photographed before it goes live.
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
            Take {money(c.offer.cashHigh)} from our partner watch specialist
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
            Relist for {relistDays} days
          </button>
          <button
            type="button"
            onClick={() => rarezy.returnItem(c.id)}
            className="text-[0.72rem] text-muted/60"
          >
            Send it back to me
          </button>
        </div>
      )}

      {c.status === "partner_settled" && (
        <p className="mt-4 text-[0.8rem] text-muted">Sold to our partner watch specialist for {money(c.offer.cashHigh)}.</p>
      )}

      {c.status === "returned" && (
        <p className="mt-4 text-[0.8rem] text-muted">
          Every ticket was refunded, minus the non-refundable processing fee.
        </p>
      )}
    </div>
  );
}
