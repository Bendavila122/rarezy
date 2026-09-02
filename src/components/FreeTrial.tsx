import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { SkillGame } from "@/components/SkillGame";

/**
 * The exact same skill mechanic real entries use, playable with no ticket and
 * no effect on any listing — proof for a skeptical buyer that this is a real
 * skill game, not a lottery, before they spend anything.
 */
type CtaAction = { href: string; onClick?: undefined } | { href?: undefined; onClick: () => void };

export function FreeTrial({ ticketCta = "Grab a real ticket", ...action }: { ticketCta?: string } & CtaAction) {
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  return (
    <div className="rounded-none border border-dashed border-brand/30 bg-brand/[0.04] p-4">
      <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
        Try it free — no ticket needed
      </p>

      {playing ? (
        <div className="mt-3">
          <SkillGame
            onComplete={(s) => {
              setScore(s);
              setPlaying(false);
            }}
          />
        </div>
      ) : score !== null ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.8rem] text-muted">
            You scored <span className="tabular font-semibold text-foreground">{score}</span>. Real tickets play for
            keeps.
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setScore(null)} className="text-[0.76rem] text-muted underline underline-offset-2">
              Try again
            </button>
            {action.href ? (
              <Link to={action.href} className="press shrink-0 rounded-none bg-brand px-4 py-2 text-[0.76rem] font-medium text-background">
                {ticketCta}
              </Link>
            ) : (
              <button
                type="button"
                onClick={action.onClick}
                className="press shrink-0 rounded-none bg-brand px-4 py-2 text-[0.76rem] font-medium text-background"
              >
                {ticketCta}
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="press mt-3 w-full rounded-none bg-brand/12 py-2.5 text-[0.8rem] font-medium text-brand"
        >
          Play a free round
        </button>
      )}
    </div>
  );
}
