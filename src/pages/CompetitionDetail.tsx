import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BadgeCheck, ShoppingBag } from "lucide-react";
import { useRarezy } from "@/lib/store";
import { authGate } from "@/lib/authGate";
import { CountdownBar } from "@/components/Countdown";
import { LeaderboardView } from "@/components/LeaderboardView";
import { SkillGame } from "@/components/SkillGame";
import { FreeTrial } from "@/components/FreeTrial";
import { marketDb, moneyFromPence, type MarketCompetition } from "@/lib/db";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

export function CompetitionDetail() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { currentUser } = useRarezy();
  const navigate = useNavigate();

  const [c, setC] = useState<MarketCompetition | null | undefined>(undefined);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([]);
  const [attempts, setAttempts] = useState<{ owed: number; used: number; remaining: number; bestScore?: number | undefined }>({
    owed: 0,
    used: 0,
    remaining: 0,
  });
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    if (!competitionId) return;
    // No scheduled job resolves competitions in this project — a visit to
    // an expired-but-still-"live" competition is what triggers the winner
    // being picked, same lazy-sweep pattern the legacy store already uses.
    await marketDb.resolveIfDue(competitionId).catch(() => {});
    marketDb.fetchCompetition(competitionId).then((comp) => {
      setC(comp);
      if (comp?.winnerUserId) marketDb.fetchUsername(comp.winnerUserId).then(setWinnerName);
    });
    marketDb.fetchLeaderboard(competitionId).then(setLeaderboard);
    if (currentUser?.id) {
      marketDb.myAttempts(competitionId, currentUser.id).then(setAttempts);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitionId, currentUser?.id]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/browse");
  };

  if (c === undefined) return null;
  if (!c) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <button type="button" onClick={goBack} className="text-[0.8rem] text-muted">
          ← Back
        </button>
        <p className="mt-6 text-[0.9rem] text-muted">That competition isn't here any more.</p>
      </div>
    );
  }

  const photos = c.product.images.map((i) => i.url);
  const raised = c.entriesSold * c.ticketPricePence;
  const target = c.maxEntries * c.ticketPricePence;
  const fundedPct = Math.max(4, Math.min(100, Math.round((raised / target) * 100)));

  const buy = async () => {
    if (!currentUser) {
      authGate.request("Create a free account to buy a ticket.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await marketDb.purchaseEntries(c.id, qty);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't complete that purchase.");
    } finally {
      setBusy(false);
    }
  };

  const submitScore = async (score: number) => {
    setPlaying(false);
    if (!competitionId) return;
    try {
      await marketDb.recordScore(competitionId, score);
    } finally {
      reload();
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <button type="button" onClick={goBack} className="text-[0.8rem] text-muted">
        ← Back
      </button>

      {photos.length > 0 && (
        <>
          <div className="mt-6 overflow-hidden rounded-none bg-white/[0.04]">
            <img src={photos[activePhoto]} alt={`${c.product.brand} ${c.product.model}`} className="aspect-[4/3] w-full object-cover" />
          </div>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2">
              {photos.map((p, i) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-none border ${i === activePhoto ? "border-brand" : "border-white/10"}`}
                >
                  <img src={p} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <p className={`${labelCls} mt-6`}>{c.product.brand}</p>
      <h1 className="mt-2 text-[1.7rem] font-semibold leading-tight tracking-[-0.03em]">
        {c.product.brand} {c.product.model}
        {c.product.reference ? ` (${c.product.reference})` : ""}
      </h1>

      <Link
        to={`/seller/${c.sellerId}`}
        className="press mt-2 inline-flex items-center gap-1.5 text-[0.72rem] text-muted hover:text-foreground"
      >
        Sold by {c.seller.businessName}
        <BadgeCheck className="h-3.5 w-3.5 text-blue-400" strokeWidth={2.2} />
      </Link>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className={labelCls}>Ticket price</p>
          <p className="tabular mt-1 text-[2rem] font-semibold leading-none tracking-[-0.04em] text-brand">
            {moneyFromPence(c.ticketPricePence)}
          </p>
        </div>
        {c.status === "live" && <p className="text-[0.78rem] text-muted">Ends {new Date(c.endsAt).toLocaleDateString("en-GB")}</p>}
      </div>

      {c.status === "live" && (
        <div className="mt-4 rounded-none bg-brand-deep p-4">
          <CountdownBar deadlineAt={c.endsAt} />
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-none bg-white/10">
              <div className="h-full rounded-none bg-mint transition-all duration-500" style={{ width: `${fundedPct}%` }} />
            </div>
            <span className="tabular shrink-0 text-[0.72rem] text-white/70">
              {c.entriesSold}/{c.maxEntries} entries
            </span>
          </div>
        </div>
      )}

      {c.status === "live" ? (
        <div className="mt-5 flex flex-col gap-2">
          <div className="flex gap-2">
            {[1, 5, 10, 25].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setQty(v)}
                className={`flex-1 rounded-none border py-2.5 text-[0.8rem] tracking-tight transition-all active:scale-[0.97] ${
                  qty === v ? "border-brand/40 bg-brand/15 text-brand" : "border-white/10 bg-white/[0.04] text-muted"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={buy}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-none bg-brand py-3.5 text-[0.88rem] font-medium tracking-tight text-background disabled:opacity-40"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            {busy ? "Processing…" : `Buy ${qty} ticket${qty > 1 ? "s" : ""} — ${moneyFromPence(c.ticketPricePence * qty)}`}
          </button>
          {error && <p className="text-[0.78rem] text-red-400">{error}</p>}
        </div>
      ) : (
        <p className="mt-5 text-[0.85rem] leading-relaxed text-muted">
          {c.status === "cancelled"
            ? "This competition closed with no entries and was cancelled."
            : c.status === "rejected" || c.status === "draft" || c.status === "pending_approval"
              ? "Entries aren't open on this one right now."
              : winnerName
                ? `This competition has closed. Won by ${winnerName}.`
                : "This competition has closed."}
        </p>
      )}

      {c.status === "live" && <div className="mt-4"><FreeTrial onClick={() => setPlaying(true)} ticketCta="Add a real ticket" /></div>}

      {c.status === "live" && attempts.remaining > 0 && (
        <div className="mt-4 rounded-none border border-brand/30 bg-brand/10 p-4">
          <p className="text-[0.8rem] text-brand">
            You have {attempts.remaining} attempt{attempts.remaining > 1 ? "s" : ""} to play.
          </p>
          {!playing ? (
            <button type="button" onClick={() => setPlaying(true)} className="mt-3 text-[0.8rem] font-medium text-brand underline underline-offset-4">
              Play now
            </button>
          ) : (
            <div className="mt-3">
              <SkillGame onComplete={submitScore} />
            </div>
          )}
        </div>
      )}

      {c.product.description && (
        <>
          <p className={`${labelCls} mt-9`}>Description</p>
          <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">{c.product.description}</p>
        </>
      )}

      <p className={`${labelCls} mt-9`}>Details</p>
      <div className="mt-3 overflow-hidden rounded-none border border-white/10">
        {[
          { label: "Condition", value: c.product.condition },
          { label: "Year", value: c.product.year },
          { label: "Box", value: c.product.box ? "Included" : undefined },
          { label: "Papers", value: c.product.papers ? "Included" : undefined },
          { label: "Accessories", value: c.product.accessories },
        ]
          .filter((row) => row.value)
          .map((row, i) => (
            <div key={row.label} className={`flex items-center justify-between px-4 py-2.5 text-[0.8rem] ${i % 2 === 1 ? "bg-white/[0.02]" : ""}`}>
              <span className="text-muted">{row.label}</span>
              <span className="text-right capitalize">{String(row.value)}</span>
            </div>
          ))}
      </div>

      {leaderboard.length > 0 && (
        <div className="mt-9">
          <p className={labelCls}>Leaderboard</p>
          <div className="mt-3">
            <LeaderboardView leaderboard={leaderboard} />
          </div>
        </div>
      )}
    </div>
  );
}
