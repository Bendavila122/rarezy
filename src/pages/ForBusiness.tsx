import { Link } from "react-router-dom";
import { Banknote, BadgeCheck, Building2, ChevronRight, ClipboardList, Store } from "lucide-react";
import { PhoneMockup } from "@/components/PhoneMockup";
import { CyclingScreens } from "@/components/CyclingScreens";
import { CyclingHeadline, type HeadlineVariant } from "@/components/CyclingHeadline";
import { Reveal } from "@/components/Reveal";
import { ListScreen, PaidScreen, ValuationScreen } from "@/components/WalkthroughScreens";
import { WhySellSection } from "@/components/WhySellSection";
import { SellerPerformanceSection } from "@/components/SellerPerformanceSection";
import { MarketingCentreShowcase } from "@/components/MarketingCentreShowcase";
import { SellerDashboardReel } from "@/components/SellerDashboardReel";
import { SellerDashboardMock } from "@/components/SellerDashboardMock";
import { PhoneFeatureSection } from "@/components/PhoneFeatureSection";
import { FaqSection } from "@/components/FaqSection";
import { BUSINESS_FAQS } from "@/lib/businessFaqs";

// Every variant shares one look — same size, weight, tracking, case, all
// white — so the rotation reads purely as "the same headline trying on a
// different typeface" rather than a mixed bag of styles.
const HEADLINE_CLASS = "text-[2.2rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[3rem]";

const HEADLINES: HeadlineVariant[] = [
  { text: "List once. We bring the customers.", className: HEADLINE_CLASS },
  { text: "Your stock. Their obsession.", className: HEADLINE_CLASS, style: { fontFamily: "var(--font-serif)" } },
  { text: "Stock moves faster here.", className: HEADLINE_CLASS, style: { fontFamily: "var(--font-grotesk)" } },
  { text: "Sell it. Skip the discount.", className: HEADLINE_CLASS, style: { fontFamily: "var(--font-mono)" } },
];

const STEPS = [
  {
    Icon: ClipboardList,
    tint: "bg-blue-500/15 text-blue-400",
    title: "Apply",
    body: "Tell us about your business — takes a couple of minutes.",
  },
  {
    Icon: BadgeCheck,
    tint: "bg-emerald-500/15 text-emerald-400",
    title: "Get approved",
    body: "We verify your business, usually within a day or two.",
  },
  {
    Icon: Store,
    tint: "bg-amber-500/15 text-amber-300",
    title: "List your stock",
    body: "Set your own ticket price, entry count and deadline per item.",
  },
  {
    Icon: Banknote,
    tint: "bg-violet-500/15 text-violet-400",
    title: "Get paid",
    body: "We handle entries and payout — you ship the prize yourself, insured and tracked.",
  },
];

/**
 * The dealer pitch, split out onto its own page rather than folded into the
 * buyer-facing home page — reuses the app's established visual language
 * (PhoneMockup, Reveal, glass cards) but leans amber/gold instead of the
 * buyer side's mint, so it reads as a distinct, business-facing space
 * rather than a re-skinned copy of Home.
 */
export function ForBusiness() {
  return (
    <div className="relative z-10">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 sm:grid-cols-2 sm:py-24">
        <div>
          <p className="flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.32em] text-amber-300">
            <Building2 className="h-3.5 w-3.5" strokeWidth={2.4} />
            Rarezy for Businesses
          </p>
          <div className="mt-4">
            <CyclingHeadline variants={HEADLINES} />
          </div>
          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-white/60">
            Turn your stock into competitions instead of markdowns. You set the terms, we market it and
            handle every entry — with zero commission, and your stock never leaves your hands.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/signup"
              state={{ accountType: "dealer" }}
              className="press flex items-center gap-1.5 bg-amber-400 px-7 py-3.5 text-[0.85rem] font-bold text-[#241a0c]"
            >
              Apply to become a seller
              <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
            <a href="#how-it-works" className="press px-4 py-3.5 text-[0.85rem] font-medium text-white/70 hover:text-white">
              See how it works
            </a>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center sm:mt-0">
          <PhoneMockup glow="oklch(0.75 0.19 80)" glow2="oklch(0.82 0.19 148)">
            <CyclingScreens screens={[ListScreen, ValuationScreen, PaidScreen]} intervalMs={3200} />
          </PhoneMockup>
        </div>
      </div>

      <WhySellSection />
      <PhoneFeatureSection />

      <SellerDashboardReel />
      <SellerDashboardMock />
      <SellerPerformanceSection />
      <MarketingCentreShowcase />

      <div id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-amber-300">How it works</p>
          <p className="mt-4 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.1rem]">
            From application to payout.
          </p>
        </Reveal>

        <div className="relative mt-14">
          {/* The connecting line sits behind the icon badges — each badge is
              fully opaque, so it visually "punctuates" the line rather than
              needing a border colour matched to whatever's behind it. */}
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/10 sm:block" />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08} y={20}>
                <div className="relative flex flex-col items-start">
                  <span className={`relative z-[1] flex h-12 w-12 items-center justify-center rounded-full ${s.tint}`}>
                    <s.Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <p className="mt-4 text-[0.95rem] font-semibold tracking-tight text-white">{s.title}</p>
                  <p className="mt-1.5 text-[0.8rem] leading-relaxed text-white/55">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <FaqSection faqs={BUSINESS_FAQS} />

      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <Reveal>
          <p className="text-[1.6rem] font-bold leading-tight tracking-[-0.02em] text-white sm:text-[2rem]">
            Ready to list your first item?
          </p>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-white/55">
            Applications are usually reviewed within a couple of days.
          </p>
          <Link
            to="/signup"
            state={{ accountType: "dealer" }}
            className="press mt-7 inline-flex items-center gap-1.5 bg-amber-400 px-8 py-4 text-[0.88rem] font-bold text-[#241a0c]"
          >
            Apply to become a seller
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
