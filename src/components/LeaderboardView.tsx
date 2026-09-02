import { Crown } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/store";

const TIER: Record<number, { row: string; badge: string }> = {
  1: {
    row: "bg-gradient-to-r from-amber-400/20 via-amber-400/[0.06] to-transparent ring-1 ring-amber-400/40",
    badge: "bg-amber-400 text-brand-deep",
  },
  2: {
    row: "bg-gradient-to-r from-slate-300/[0.14] via-slate-300/[0.04] to-transparent",
    badge: "bg-slate-300 text-brand-deep",
  },
  3: {
    row: "bg-gradient-to-r from-orange-400/[0.14] via-orange-400/[0.04] to-transparent",
    badge: "bg-orange-400 text-brand-deep",
  },
};

function Row({ rank, entry }: { rank: number; entry: LeaderboardEntry }) {
  const tier = TIER[rank];

  return (
    <div
      className={`flex items-center gap-3 rounded-none px-4 py-3 ${
        entry.isYou ? "bg-brand/15 ring-1 ring-brand/40" : (tier?.row ?? "bg-white/[0.04]")
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.72rem] font-bold ${
          tier?.badge ?? "bg-white/10 text-white/70"
        }`}
      >
        {rank === 1 ? <Crown className="h-3.5 w-3.5" strokeWidth={2.4} /> : rank}
      </span>
      <span className={`flex-1 truncate text-[0.85rem] tracking-tight ${rank <= 3 ? "font-semibold" : "font-medium"}`}>
        {entry.name}
      </span>
      <span className="tabular text-[0.85rem] font-semibold text-white/80">{entry.score}</span>
    </div>
  );
}

/** Top 10, plus your own row if you're outside it — with an ellipsis marking the gap. The top three are colour-coded (gold/silver/bronze) so the leaderboard reads as a real leaderboard, not a plain list. */
export function LeaderboardView({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  const top10 = leaderboard.slice(0, 10);
  const youIndex = leaderboard.findIndex((e) => e.isYou);
  const youInTop10 = youIndex >= 0 && youIndex < 10;

  return (
    <div className="flex flex-col gap-1.5">
      {top10.map((e, i) => (
        <Row key={e.name + i} rank={i + 1} entry={e} />
      ))}
      {!youInTop10 && youIndex >= 0 && (
        <>
          <div className="py-0.5 text-center text-[0.7rem] tracking-[0.3em] text-muted">···</div>
          <Row rank={youIndex + 1} entry={leaderboard[youIndex]!} />
        </>
      )}
    </div>
  );
}
