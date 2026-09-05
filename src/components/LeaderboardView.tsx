import { Crown, Medal, TrendingUp, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/store";

const PODIUM: Record<number, { ring: string; avatar: string; icon: string; height: string }> = {
  1: {
    ring: "ring-2 ring-amber-400/70",
    avatar: "bg-gradient-to-br from-amber-300 to-amber-500 text-brand-deep",
    icon: "text-amber-400",
    height: "pt-0",
  },
  2: {
    ring: "ring-1 ring-slate-300/50",
    avatar: "bg-gradient-to-br from-slate-200 to-slate-400 text-brand-deep",
    icon: "text-slate-300",
    height: "pt-5",
  },
  3: {
    ring: "ring-1 ring-orange-400/50",
    avatar: "bg-gradient-to-br from-orange-300 to-orange-500 text-brand-deep",
    icon: "text-orange-400",
    height: "pt-5",
  },
};

const initials = (name: string) =>
  name
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function PodiumSpot({ rank, entry }: { rank: number; entry: LeaderboardEntry }) {
  const style = PODIUM[rank]!;
  return (
    <div className={`flex flex-col items-center ${style.height}`}>
      {rank === 1 ? (
        <Crown className={`h-5 w-5 ${style.icon}`} strokeWidth={2.2} />
      ) : (
        <Medal className={`h-4 w-4 ${style.icon}`} strokeWidth={2.2} />
      )}
      <div
        className={`mt-1.5 flex items-center justify-center rounded-full font-bold ${style.avatar} ${style.ring} ${
          rank === 1 ? "h-14 w-14 text-[1.05rem]" : "h-11 w-11 text-[0.85rem]"
        } ${entry.isYou ? "outline outline-2 outline-offset-2 outline-brand" : ""}`}
      >
        {initials(entry.name)}
      </div>
      <p className="mt-2 max-w-[5.5rem] truncate text-center text-[0.78rem] font-semibold tracking-tight">
        {entry.name}
      </p>
      <p className="tabular text-[0.95rem] font-bold leading-tight text-white/90">{entry.score.toLocaleString("en-GB")}</p>
    </div>
  );
}

function BarRow({ rank, entry, topScore }: { rank: number; entry: LeaderboardEntry; topScore: number }) {
  const pct = topScore > 0 ? Math.max(8, Math.round((entry.score / topScore) * 100)) : 0;

  return (
    <div
      className={`relative overflow-hidden rounded-none ${
        entry.isYou ? "ring-1 ring-brand/50" : ""
      }`}
    >
      <div
        className={`absolute inset-y-0 left-0 ${entry.isYou ? "bg-brand/[0.14]" : "bg-white/[0.05]"}`}
        style={{ width: `${pct}%` }}
      />
      <div className="relative flex items-center gap-3 px-4 py-2.5">
        <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.68rem] font-bold text-white/70">
          {rank}
        </span>
        <span className="flex-1 truncate text-[0.85rem] font-medium tracking-tight">
          {entry.name}
          {entry.isYou && <span className="ml-1.5 text-[0.68rem] font-semibold text-brand">YOU</span>}
        </span>
        <span className="tabular text-[0.85rem] font-semibold text-white/85">{entry.score.toLocaleString("en-GB")}</span>
      </div>
    </div>
  );
}

/**
 * A podium for the top 3 (gold/silver/bronze avatars, crown/medal icons),
 * then a bar-chart-style list for the rest — each row's fill width scaled
 * to the leader's score, so the spread between scores reads at a glance
 * instead of just as a column of numbers. Closes with an insight line
 * telling the signed-in player exactly how far they are from the top,
 * rather than leaving them to do the maths themselves.
 */
export function LeaderboardView({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  if (leaderboard.length === 0) return null;

  const top10 = leaderboard.slice(0, 10);
  const podium = top10.slice(0, 3);
  const rest = top10.slice(3);
  const topScore = top10[0]!.score;

  const youIndex = leaderboard.findIndex((e) => e.isYou);
  const you = youIndex >= 0 ? leaderboard[youIndex] : undefined;
  const youInTop10 = youIndex >= 0 && youIndex < 10;

  return (
    <div className="overflow-hidden rounded-none border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">
          <Trophy className="h-3.5 w-3.5 text-amber-400" strokeWidth={2} />
          Leaderboard
        </p>
        <p className="tabular text-[0.7rem] text-muted">Top score {topScore.toLocaleString("en-GB")}</p>
      </div>

      {podium.length === 3 && (
        <div className="grid grid-cols-3 items-end gap-2 px-4 pb-5 pt-6">
          <PodiumSpot rank={2} entry={podium[1]!} />
          <PodiumSpot rank={1} entry={podium[0]!} />
          <PodiumSpot rank={3} entry={podium[2]!} />
        </div>
      )}

      <div className="flex flex-col gap-1 p-2.5 pt-0">
        {(podium.length === 3 ? rest : top10).map((e, i) => (
          <BarRow key={e.name + i} rank={(podium.length === 3 ? 4 : 1) + i} entry={e} topScore={topScore} />
        ))}
        {!youInTop10 && you && (
          <>
            <div className="py-0.5 text-center text-[0.7rem] tracking-[0.3em] text-muted">···</div>
            <BarRow rank={youIndex + 1} entry={you} topScore={topScore} />
          </>
        )}
      </div>

      {you && (
        <div className="flex items-center gap-2 border-t border-white/10 bg-brand/[0.06] px-4 py-3">
          <TrendingUp className="h-3.5 w-3.5 shrink-0 text-brand" strokeWidth={2.2} />
          <p className="text-[0.76rem] leading-snug text-white/80">
            {youIndex === 0
              ? "You're in the lead — nice work."
              : `You're #${youIndex + 1}, ${(topScore - you.score).toLocaleString("en-GB")} points off the top spot.`}
          </p>
        </div>
      )}
    </div>
  );
}
