import { ArrowRight, BadgeCheck, Banknote, FileText } from "lucide-react";
import { PersonaSection } from "@/components/PersonaSection";
import { ListScreen, ValuationScreen, PaidScreen } from "@/components/WalkthroughScreens";

const STEPS = [
  { headline: "Tell us about your watch.", Screen: ListScreen },
  { headline: "Get an instant, honest valuation.", Screen: ValuationScreen },
  { headline: "Get paid — often more than it's worth.", Screen: PaidScreen },
];

const STEP_ITEMS = [
  { label: "Tell us about it", Icon: FileText },
  { label: "We authenticate", Icon: BadgeCheck },
  { label: "Get paid", Icon: Banknote },
] as const;

/** Mirrors BuyerSection's how-it-works strip, right-aligned to match this hero's reversed layout. */
function HowItWorksStrip() {
  return (
    <div className="flex flex-wrap items-center justify-end gap-x-2.5 gap-y-2 text-[0.78rem] font-bold tracking-tight text-white/70">
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

export function SellerSection() {
  return (
    <PersonaSection
      eyebrow="For sellers"
      Icon={Banknote}
      accent="text-mint"
      glow="oklch(0.75 0.19 80)"
      glow2="oklch(0.82 0.19 148)"
      steps={STEPS}
      subtext="No haggling, no lowball offers. We authenticate it, list it for the community to compete over, and pay out — often more than a private sale ever would."
      ctaLabel="Start selling"
      ctaTo="/sell"
      reverse
      stepStrip={<HowItWorksStrip />}
    />
  );
}
