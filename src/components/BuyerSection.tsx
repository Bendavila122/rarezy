import { motion } from "motion/react";
import { ArrowRight, Gamepad2, HelpCircle, Sparkles, Ticket, Trophy } from "lucide-react";
import { PersonaSection } from "@/components/PersonaSection";
import { BrowseScreen, WinScreen } from "@/components/WalkthroughScreens";
import { tourState } from "@/lib/tourState";

const STEPS = [
  { headline: "Browse the watch you actually want.", Screen: BrowseScreen },
  { headline: "Take it home for a fraction of the price.", Screen: WinScreen },
];

/** Opens the "what do we actually do" explainer tour — a big, hard-to-miss button in the hero's corner. */
function WhatWeDoButton() {
  return (
    <button
      type="button"
      onClick={() => tourState.open()}
      className="glass-dark press relative flex w-56 items-center justify-center gap-2 border border-mint/30 py-3 text-[0.82rem] font-bold tracking-tight text-white sm:w-64"
    >
      <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-mint"
          animate={{ scale: [1, 2.4], opacity: [0.8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-mint" />
      </span>
      <HelpCircle className="h-4 w-4 text-mint" strokeWidth={2.2} />
      What do we actually do?
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
      corner={<WhatWeDoButton />}
      stepStrip={<HowItWorksStrip />}
    />
  );
}
