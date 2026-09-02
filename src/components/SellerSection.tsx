import { Banknote } from "lucide-react";
import { PersonaSection } from "@/components/PersonaSection";
import { ListScreen, ValuationScreen, PaidScreen } from "@/components/WalkthroughScreens";

const STEPS = [
  { headline: "Tell us about your watch.", Screen: ListScreen },
  { headline: "Get an instant, honest valuation.", Screen: ValuationScreen },
  { headline: "Get paid — often more than it's worth.", Screen: PaidScreen },
];

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
    />
  );
}
