import { Link } from "react-router-dom";
import { ArrowRight, PartyPopper } from "lucide-react";

/** Slim announcement strip right under the header — blurred glass so it reads as part of the page, not a solid banner slapped on top. */
export function PromoBanner() {
  return (
    <div className="glass-dark relative z-10 w-full">
      <Link
        to="/browse"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-6 py-2.5 text-center text-[0.8rem] font-semibold tracking-tight text-white/85 transition-colors hover:text-white"
      >
        <PartyPopper className="h-3.5 w-3.5 shrink-0 text-mint" strokeWidth={2.2} />
        <span>
          Win a luxury watch for <span className="text-mint">£2</span> — new competitions close daily
        </span>
        <span className="inline-flex items-center gap-1 text-mint">
          Browse now
          <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
        </span>
      </Link>
    </div>
  );
}
