import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Gamepad2, Search, Sparkles, Ticket, Trophy } from "lucide-react";
import { PersonaSection } from "@/components/PersonaSection";
import { BrowseScreen, WinScreen } from "@/components/WalkthroughScreens";
import { SearchLogoBadge } from "@/components/SearchLogoBadge";
import { browseState } from "@/lib/browseState";
import { useRarezy, type CompetitionListing } from "@/lib/store";

const STEPS = [
  { headline: "Browse the watch you actually want.", Screen: BrowseScreen },
  { headline: "Take it home for a fraction of the price.", Screen: WinScreen },
];

const TYPE_SPEED = 45;
const CLEAR_SPEED = 18;
const HOLD_MS = 1700;

/** Types out `text`, waits, deletes it, then hands control back to the caller to swap in the next phrase — a loop-friendly single-phrase typewriter. */
function useTypewriterCycle(phrases: readonly string[]) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const text = phrases[index] ?? "";
    if (!clearing) {
      if (display.length < text.length) {
        const id = window.setTimeout(() => setDisplay(text.slice(0, display.length + 1)), TYPE_SPEED);
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => setClearing(true), HOLD_MS);
      return () => window.clearTimeout(id);
    }
    if (display.length > 0) {
      const id = window.setTimeout(() => setDisplay((d) => d.slice(0, -1)), CLEAR_SPEED);
      return () => window.clearTimeout(id);
    }
    setClearing(false);
    setIndex((i) => (i + 1) % phrases.length);
    return undefined;
  }, [display, clearing, index, phrases]);

  return display;
}

/** Straight-to-results search — no filters or sort here, just type and go. Those live on the Browse page itself, seeded with whatever's typed here via `browseState`. The placeholder types out a loop of what's actually available, one category at a time. */
function HeroSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { records } = useRarezy();
  const liveCount = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && r.status === "live",
  ).length;

  const phrases = [
    `Search from ${liveCount} watches`,
    "Search from 24 electronics",
    "Search from 1 cash prize",
    "Search from 16 handbags",
    "Search from 12 clothing items",
    "Search from 8 cars",
  ];
  const typed = useTypewriterCycle(phrases);

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
        aria-label="Search watches"
        className="w-full rounded-none border-none bg-transparent py-3.5 pl-11 pr-12 text-[0.92rem] tracking-tight text-white outline-none"
      />
      {query.length === 0 && (
        <span className="pointer-events-none absolute left-11 top-1/2 flex -translate-y-1/2 items-center text-[0.92rem] tracking-tight text-white/40">
          {typed}
          <span className="ml-0.5 animate-pulse">▌</span>
        </span>
      )}
      <SearchLogoBadge />
    </form>
  );
}

const STEP_ITEMS = [
  { label: "Enter from £1", Icon: Ticket },
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
        </div>
      }
      stepStrip={<HowItWorksStrip />}
    />
  );
}
