import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { entryPricing, glyphOf, money, titleOf } from "@/lib/marketplace";
import { more4me, useMore4Me } from "@/lib/store";
import { SkillGame } from "@/components/SkillGame";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

function daysLeft(deadlineAt: string) {
  const ms = new Date(deadlineAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const { records, wallet } = useMore4Me();
  const [qty, setQty] = useState(1);
  const [playing, setPlaying] = useState(false);

  const c = records.find((r) => r.id === itemId && r.kind === "competition");

  if (!c || c.kind !== "competition") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/browse" className="text-[0.8rem] text-muted">
          ← Back to competitions
        </Link>
        <p className="mt-6 text-[0.9rem] text-muted">That listing isn't here any more.</p>
      </div>
    );
  }

  const pricing = entryPricing(c.entryFee);
  const raised = c.entriesSold * c.entryFee;
  const pct = Math.min(100, (raised / c.targetMax) * 100);
  const myRank = c.leaderboard.findIndex((e) => e.isYou);
  const cost = Math.round(pricing.charge * qty * 100) / 100;
  const canAfford = cost <= wallet.balance;

  const enter = () => {
    more4me.enter(c.id, qty);
    setQty(1);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/browse" className="text-[0.8rem] text-muted">
        ← Back to competitions
      </Link>

      <p className={`${labelCls} mt-6`}>
        {glyphOf(c.item.category)} {c.item.brand}
      </p>
      <h1 className="mt-2 text-[1.7rem] font-semibold leading-tight tracking-[-0.03em]">
        {titleOf(c.item)}
      </h1>

      {c.certificateId && (
        <p className="mt-2 text-[0.72rem] text-muted">Authenticated · Certificate {c.certificateId}</p>
      )}

      {c.status !== "live" ? (
        <p className="mt-8 text-[0.85rem] leading-relaxed text-muted">
          {c.status === "closed"
            ? `This competition has closed. Won by ${c.winnerName}.`
            : "Entries aren't open on this one right now."}
        </p>
      ) : (
        <>
          <p className="tabular mt-8 text-[2.1rem] font-semibold leading-none tracking-[-0.04em] text-gold">
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
            {c.entriesSold.toLocaleString("en-GB")} entries sold · {daysLeft(c.deadlineAt)} days left
          </p>

          {c.leaderboard.length > 0 && (
            <div className="mt-8">
              <p className={labelCls}>Leaderboard</p>
              <div className="mt-3 flex flex-col gap-1.5">
                {c.leaderboard.slice(0, 5).map((e, idx) => (
                  <div
                    key={e.name}
                    className={`flex items-center justify-between rounded-2xl px-4 py-2.5 ${
                      e.isYou ? "bg-gold/15" : "bg-white/4"
                    }`}
                  >
                    <span className="text-[0.82rem] tracking-tight">
                      #{idx + 1} {e.name}
                    </span>
                    <span className="tabular text-[0.82rem] text-muted">{e.score}</span>
                  </div>
                ))}
              </div>
              {c.myBestScore !== undefined && myRank < 0 && (
                <p className="mt-2 text-[0.68rem] text-muted">
                  Your best is {c.myBestScore} — outside the top {c.leaderboard.length}.
                </p>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {playing && c.attemptsRemaining > 0 ? (
              <motion.div
                key="game"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card mt-9 p-6"
              >
                <p className={`${labelCls} text-center`}>
                  {c.attemptsRemaining} attempt{c.attemptsRemaining > 1 ? "s" : ""} left
                </p>
                <SkillGame key={c.attemptsRemaining} onComplete={(score) => more4me.recordScore(c.id, score)} />
              </motion.div>
            ) : c.attemptsRemaining > 0 ? (
              <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-9">
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="w-full rounded-full bg-gold py-4 text-[0.9rem] font-medium tracking-tight text-background"
                >
                  Play {c.attemptsRemaining} attempt{c.attemptsRemaining > 1 ? "s" : ""}
                </button>
              </motion.div>
            ) : (
              <motion.div key="enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-9">
                <p className={labelCls}>Entries</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1, 5, 10, 25].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setQty(v)}
                      className={`rounded-full border px-4 py-2 text-[0.8rem] tracking-tight transition-all active:scale-[0.97] ${
                        qty === v ? "border-gold/40 bg-gold/15 text-gold" : "border-white/10 bg-white/4 text-muted"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-[0.78rem] text-muted">
                  {qty} × {money(pricing.charge)} = {money(cost)} at checkout
                </p>
                <p className="mt-1 text-[0.68rem] text-muted">Includes a 50% processing fee, VAT accounted for.</p>
                {!canAfford && (
                  <p className="mt-2 text-[0.72rem] text-red-400">
                    Not enough in your wallet — <Link to="/account" className="underline">top up</Link>.
                  </p>
                )}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={enter}
                    disabled={!canAfford}
                    className="w-full rounded-full bg-gold py-4 text-[0.9rem] font-medium tracking-tight text-background disabled:opacity-30"
                  >
                    Enter for {money(cost)}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
