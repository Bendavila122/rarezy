import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Gamepad2, HelpCircle, Search, Sparkles, Ticket, Trophy } from "lucide-react";
import { PersonaSection } from "@/components/PersonaSection";
import { BrowseScreen, WinScreen } from "@/components/WalkthroughScreens";
import { browseState } from "@/lib/browseState";
import { tourState, TOUR_PHONE_LAYOUT_ID, useTourState } from "@/lib/tourState";
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
    <form onSubmit={submit} className="glass-dark relative w-72 sm:w-[24rem]">
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

/** Opens the "what do we actually do" explainer tour. */
function WhatWeDoButton() {
  return (
    <button
      type="button"
      onClick={() => tourState.open()}
      className="group glass-dark brand-glow press relative inline-flex items-center gap-2.5 overflow-hidden border border-mint/40 px-5 py-3 text-[0.82rem] font-bold tracking-tight"
    >
      <span className="absolute -right-1.5 -top-1.5 z-20 flex h-3.5 w-3.5">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-red-500"
          animate={{ scale: [1, 2.4], opacity: [0.8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500" />
      </span>
      <span className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-300 ease-out group-hover:scale-x-100" />
      <span className="relative z-10 flex items-center gap-2.5 text-white transition-colors duration-300 group-hover:text-black">
        <HelpCircle className="h-[1.1rem] w-[1.1rem] text-mint transition-colors duration-300 group-hover:text-black" strokeWidth={2.2} />
        What do we actually do?
      </span>
    </button>
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
  const { open: tourOpen } = useTourState();

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
      phoneLayoutId={TOUR_PHONE_LAYOUT_ID}
      hidePhone={tourOpen}
      corner={
        <div className="relative flex w-full flex-col gap-4">
          <div className="flex justify-start">
            <WhatWeDoButton />
          </div>
          <div className="flex justify-center sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
            <HeroSearch />
          </div>
        </div>
      }
      stepStrip={<HowItWorksStrip />}
    />
  );
}
