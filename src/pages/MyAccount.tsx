import { motion } from "motion/react";
import { useState } from "react";
import { DEADLINE_OPTIONS, glyphOf, money, titleOf } from "@/lib/marketplace";
import { more4me, useMore4Me, type CompetitionListing } from "@/lib/store";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

function daysLeft(deadlineAt: string) {
  const ms = new Date(deadlineAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

const STATUS_LABEL: Record<CompetitionListing["status"], string> = {
  authenticating: "Being authenticated",
  live: "Live",
  closed: "Closed",
  awaiting_decision: "Needs your decision",
  partner_settled: "Sold to partner jeweller",
  returned: "Returned to you",
};

export function MyAccount() {
  const { wallet, records } = useMore4Me();
  const mine = records.filter((r) => r.kind === "cash" || !r.isHouseStock);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className={labelCls}>Wallet</p>
      <p className="tabular mt-3 text-[2.6rem] font-semibold leading-none tracking-[-0.04em] text-gold">
        {money(wallet.balance)}
      </p>
      <div className="mt-5 flex gap-2">
        {[50, 200, 1000].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => more4me.topUp(v)}
            className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-[0.78rem] tracking-tight text-muted transition-all active:scale-[0.97]"
          >
            + {money(v)}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[0.68rem] text-muted/70">
        Demo funds — a real deployment would top this up through a payment provider.
      </p>

      <h2 className="mt-12 text-[1.3rem] font-semibold tracking-[-0.02em]">My listings</h2>
      {mine.length === 0 ? (
        <p className="mt-6 text-[0.85rem] text-muted">
          Nothing here yet. Sell something and it'll show up the moment you do.
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
                  <p className={labelCls}>{glyphOf(r.item.category)} Instant cash — paid</p>
                  <p className="mt-3 text-[1.05rem] tracking-tight">{titleOf(r.item)}</p>
                  <p className="tabular mt-2 text-[1.4rem] font-semibold leading-none tracking-[-0.03em] text-gold">
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
          <p className={labelCls}>
            {glyphOf(c.item.category)} {STATUS_LABEL[c.status]}
          </p>
          <p className="mt-3 text-[1.05rem] tracking-tight">{titleOf(c.item)}</p>
        </div>
        {c.status === "live" && (
          <span className="tabular shrink-0 text-[0.68rem] uppercase tracking-[0.2em] text-muted">
            {daysLeft(c.deadlineAt)}d left
          </span>
        )}
      </div>

      {c.status === "authenticating" && (
        <p className="mt-4 text-[0.8rem] leading-relaxed text-muted">
          With our partner jeweller now — checked, certified and photographed before it goes live.
        </p>
      )}

      {(c.status === "live" || c.status === "awaiting_decision" || c.status === "closed") && (
        <>
          <p className="tabular mt-4 text-[1.4rem] font-semibold leading-none tracking-[-0.03em]">
            {money(raised)}
            <span className="ml-2 text-[0.72rem] font-normal text-muted">of up to {money(c.targetMax)}</span>
          </p>
          <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gold"
            />
          </div>
          <p className="mt-3 text-[0.68rem] text-muted">
            Minimum {money(c.minimumPrice)} · {c.entriesSold.toLocaleString("en-GB")} entries sold
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
          onClick={() => more4me.previewDeadline(c.id)}
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
            onClick={() => more4me.acceptCurrentRaise(c.id)}
            className="w-full rounded-full border border-gold/40 py-3 text-[0.85rem] font-medium text-gold"
          >
            Accept {money(raised)}
          </button>
          <button
            type="button"
            onClick={() => more4me.takePartnerOffer(c.id)}
            className="w-full rounded-full border border-gold/40 py-3 text-[0.85rem] font-medium text-gold"
          >
            Take {money(c.offer.cashHigh)} from our partner jeweller
          </button>
          <div className="flex flex-wrap gap-2">
            {DEADLINE_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setRelistDays(d)}
                className={`rounded-full border px-3.5 py-2 text-[0.72rem] tracking-tight transition-all active:scale-[0.97] ${
                  relistDays === d ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/4 text-muted"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => more4me.relist(c.id, relistDays)}
            className="w-full rounded-full border border-white/10 py-3 text-[0.85rem] font-medium text-muted"
          >
            Relist for {relistDays} days
          </button>
          <button
            type="button"
            onClick={() => more4me.returnItem(c.id)}
            className="text-[0.72rem] text-muted/60"
          >
            Send it back to me
          </button>
        </div>
      )}

      {c.status === "partner_settled" && (
        <p className="mt-4 text-[0.8rem] text-muted">Sold to our partner jeweller for {money(c.offer.cashHigh)}.</p>
      )}

      {c.status === "returned" && (
        <p className="mt-4 text-[0.8rem] text-muted">
          Every entry was refunded, minus the non-refundable processing fee.
        </p>
      )}
    </div>
  );
}
