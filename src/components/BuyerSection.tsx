import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Gamepad2, Search, Sparkles, Ticket, Trophy } from "lucide-react";
import { PersonaSection } from "@/components/PersonaSection";
import { BrowseScreen, WinScreen } from "@/components/WalkthroughScreens";
import { LogoEater } from "@/components/LogoEater";
import { browseState } from "@/lib/browseState";
import { useRarezy, type CompetitionListing } from "@/lib/store";

const STEPS = [
  { headline: "Browse the watch you actually want.", Screen: BrowseScreen },
  { headline: "Take it home for a fraction of the price.", Screen: WinScreen },
];

/** Straight-to-results search — no filters or sort here, just type and go. Those live on the Browse page itself, seeded with whatever's typed here via `browseState`. */
function HeroSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { records } = useRarezy();
  const liveCount = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && r.status === "live",
  ).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    browseState.set({ query });
    navigate("/browse");
  };

  return (
    <form onSubmit={submit} className="glass-dark relative z-10 w-72 sm:w-[24rem]">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" strokeWidth={2} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search from ${liveCount} watches`}
        className="w-full rounded-none border-none bg-transparent py-3.5 pl-11 pr-4 text-[0.92rem] tracking-tight text-white outline-none placeholder:text-white/40"
      />
    </form>
  );
}

const STEP_ITEMS = [
  { label: "Enter for £2", Icon: Ticket },
  { label: "Play", Icon: Gamepad2 },
  { label: "Best score wins", Icon: Trophy },
] as const;

/** Spells out the core mechanic in one glance — same eyebrow-style typography as the rest of the hero, so it reads as part of it rather than a bolted-on banner. */
function HowItWorksStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[0.78rem] font-bold tracking-tight text-white/70">
      {STEP_ITEMS.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2.5">
          {i > 0 && <ArrowRight className="h-3 w-3 text-white/25" strokeWidth={2.4} />}
          <span className="flex items-center gap-1.5">
            <item.Icon className="h-3.5 w-3.5 text-mint" strokeWidth={2.2} />
            {item.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export function BuyerSection() {
  return (
    <PersonaSection
      eyebrow="For buyers"
      Icon={Sparkles}
      accent="text-amber-300"
      glow="oklch(0.82 0.19 148)"
      glow2="oklch(0.82 0.16 80)"
      steps={STEPS}
      subtext="Every listing is real stock, independently authenticated and ready to ship. Enter for a few pounds, play one quick round below, and the best score takes the watch home."
      ctaLabel="Browse all watches"
      ctaTo="/browse"
      corner={
        <div className="flex w-full items-center justify-start">
          <HeroSearch />
          <LogoEater />
        </div>
      }
      stepStrip={<HowItWorksStrip />}
    />
  );
}
