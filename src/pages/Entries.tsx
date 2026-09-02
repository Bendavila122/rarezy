import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AlertTriangle, Ticket, Trophy } from "lucide-react";
import { titleOf } from "@/lib/marketplace";
import { rarezy, useRarezy, type CompetitionListing } from "@/lib/store";
import { SkillGame } from "@/components/SkillGame";
import { FullscreenGame } from "@/components/FullscreenGame";
import { LeaderboardView } from "@/components/LeaderboardView";
import { AccountRequired } from "@/components/AccountRequired";

export function Entries() {
  const { records, currentUser } = useRarezy();
  const mine = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && r.myEntries > 0,
  );

  if (!currentUser) {
    return (
      <AccountRequired
        title="Create an account to play"
        body="Sign up to buy tickets and see your entries and scores here."
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">My entries</h1>
      <p className="mt-2 text-[0.85rem] text-muted">
        Watches you've bought tickets for, and how many chances you have left to play.
      </p>

      {mine.length === 0 ? (
        <p className="mt-14 text-center text-[0.9rem] text-muted">
          No entries yet.{" "}
          <Link to="/browse" className="text-brand underline underline-offset-4">
            Browse watches
          </Link>{" "}
          and add a ticket to your basket.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {mine.map((c) => (
            <EntryCard key={c.id} listing={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function EntryCard({ listing: c }: { listing: CompetitionListing }) {
  const [confirming, setConfirming] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [added, setAdded] = useState(false);

  const youWon = c.status === "closed" && c.winnerName === "You";

  const finishPlay = (score: number) => {
    rarezy.recordScore(c.id, score);
    setLastScore(score);
    setPlaying(false);
  };

  const buyAnother = () => {
    rarezy.addToBasket(c.id, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const myRank = c.leaderboard.findIndex((e) => e.isYou);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-4">
          {c.item.photos?.[0] && (
            <Link to={`/item/${c.id}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-none bg-white/[0.04]">
              <img src={c.item.photos[0]} alt={titleOf(c.item)} className="h-full w-full object-cover" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.62rem] uppercase tracking-[0.2em] text-muted">{c.item.brand}</p>
            <Link to={`/item/${c.id}`} className="mt-1 block truncate text-[0.95rem] tracking-tight">
              {titleOf(c.item)}
            </Link>
            <p className="mt-1.5 text-[0.72rem] text-muted">
              {c.myEntries} ticket{c.myEntries > 1 ? "s" : ""} bought
              {c.myBestScore !== undefined && <> · best score {c.myBestScore}</>}
            </p>
          </div>
        </div>

        {c.leaderboard.length > 0 && (
          <div className="flex shrink-0 flex-col items-end text-right">
            {myRank >= 0 && (
              <>
                <p className="text-[0.58rem] uppercase tracking-[0.2em] text-muted">You're in</p>
                <p className="tabular text-[1.4rem] font-bold leading-none text-mint">#{myRank + 1}</p>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowLeaderboard((v) => !v)}
              className="mt-2 text-[0.72rem] font-medium text-brand underline underline-offset-2"
            >
              {showLeaderboard ? "Hide leaderboard" : "View leaderboard"}
            </button>
          </div>
        )}
      </div>

      {youWon && (
        <p className="mt-4 flex items-center gap-2 rounded-none bg-brand/15 px-4 py-3 text-[0.82rem] font-medium text-brand">
          <Trophy className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          You won this watch!
        </p>
      )}
      {c.status === "closed" && !youWon && (
        <p className="mt-4 text-[0.8rem] text-muted">This listing has closed. Won by {c.winnerName}.</p>
      )}

      {lastScore !== null && (
        <p className="mt-4 rounded-none bg-white/[0.04] px-4 py-3 text-[0.82rem]">
          You scored <span className="tabular font-semibold">{lastScore}</span>
        </p>
      )}

      <AnimatePresence mode="wait">
        {confirming ? (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded-none border border-white/10 p-4">
            <p className="flex items-start gap-2 text-[0.82rem] leading-relaxed">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={1.8} />
              Are you sure you want to play now? Once you start, you can't go back and play this attempt later.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setPlaying(true);
                  setLastScore(null);
                }}
                className="flex-1 rounded-none bg-brand py-2.5 text-[0.82rem] font-medium text-background"
              >
                Yes, I'm sure
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-none border border-white/10 py-2.5 text-[0.82rem] font-medium text-muted"
              >
                Not yet
              </button>
            </div>
          </motion.div>
        ) : (
          !playing &&
          c.status === "live" &&
          c.attemptsRemaining > 0 && (
            <motion.div key="play-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="w-full rounded-none bg-brand py-3 text-[0.85rem] font-medium tracking-tight text-background"
              >
                Play — {c.attemptsRemaining} attempt{c.attemptsRemaining > 1 ? "s" : ""} left
              </button>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {playing && (
        <FullscreenGame title={`Playing for the ${c.item.brand} ${c.item.model}`}>
          <SkillGame onComplete={finishPlay} />
        </FullscreenGame>
      )}

      {!playing && !confirming && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {c.status === "live" && (
            <button
              type="button"
              onClick={buyAnother}
              className="flex items-center gap-1 text-[0.76rem] text-brand"
            >
              <Ticket className="h-3.5 w-3.5" strokeWidth={1.8} />
              {added ? "Added to basket" : "Buy another ticket"}
            </button>
          )}
        </div>
      )}

      {showLeaderboard && c.leaderboard.length > 0 && (
        <div className="mt-3">
          <LeaderboardView leaderboard={c.leaderboard} />
        </div>
      )}
    </div>
  );
}
