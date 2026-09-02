import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PhoneMockup } from "@/components/PhoneMockup";
import { Reveal } from "@/components/Reveal";

type Step = { headline: string; Screen: () => React.JSX.Element };

/**
 * One scroll beat built around a single floating 3D phone whose screen —
 * and the headline beside it — auto-advance through a short story. `reverse`
 * mirrors the layout (phone left / text right) so the buyer and seller
 * sections read as clearly distinct halves of the same page, per
 * link.me/agencies' alternating-side pattern. Deliberately has no background
 * of its own — Home renders one continuous mesh behind every section, so the
 * page reads as one surface rather than a stack of separately-coloured
 * blocks.
 */
export function PersonaSection({
  eyebrow,
  Icon,
  accent,
  glow,
  glow2,
  steps,
  subtext,
  ctaLabel,
  ctaTo,
  reverse = false,
  corner,
}: {
  eyebrow: string;
  Icon: LucideIcon;
  accent: string;
  glow: string;
  glow2: string;
  steps: Step[];
  subtext: string;
  ctaLabel: string;
  ctaTo: string;
  reverse?: boolean;
  corner?: ReactNode;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % steps.length), 4200);
    return () => window.clearInterval(id);
  }, [steps.length]);

  const step = steps[index]!;
  const Screen = step.Screen;

  const phone = (
    <Reveal delay={0.1} y={36} className={`order-2 ${reverse ? "sm:order-1" : "sm:order-2"}`}>
      <PhoneMockup glow={glow} glow2={glow2} floatDelay={reverse ? 1.4 : 0}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="h-full"
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </PhoneMockup>
    </Reveal>
  );

  const text = (
    <Reveal delay={0} y={24} className={`order-1 ${reverse ? "sm:order-2 sm:text-right" : "sm:order-1"}`}>
      <p
        className={`flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.32em] ${accent} ${
          reverse ? "sm:justify-end" : ""
        }`}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
        {eyebrow}
      </p>

      <div className="mt-4" style={{ perspective: 500 }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            transition={{ duration: 0.25 }}
            style={
              index % 2 === 0
                ? { fontFamily: "var(--font-display)", fontStyle: "italic" }
                : { fontFamily: "var(--font-sans)", fontStyle: "normal" }
            }
            className={`flex flex-wrap gap-x-[0.32em] text-[1.9rem] font-extrabold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.5rem] ${
              reverse ? "sm:justify-end" : ""
            }`}
          >
            {step.headline.split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 16, rotateX: -50 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                style={{ display: "inline-block", transformOrigin: "bottom" }}
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className={`mt-5 text-[0.95rem] leading-relaxed text-white/55 sm:text-[1rem] ${reverse ? "sm:ml-auto" : ""} max-w-md`}>
        {subtext}
      </p>

      <Link
        to={ctaTo}
        className="brand-glow press mt-7 inline-block rounded-none bg-mint px-7 py-3.5 text-[0.85rem] font-bold text-brand-deep"
      >
        {ctaLabel}
      </Link>
    </Reveal>
  );

  return (
    <div className="relative z-10 flex min-h-[85vh] items-center overflow-hidden">
      {corner && (
        <div className="absolute inset-x-0 top-9 z-[5] flex justify-center px-6 sm:inset-x-auto sm:left-6 sm:top-6 sm:justify-start sm:px-0">
          {corner}
        </div>
      )}
      <div
        className={`relative z-[2] mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-6 pb-20 sm:grid-cols-2 sm:gap-10 sm:py-20 ${
          corner ? "pt-36" : "pt-20"
        }`}
      >
        {phone}
        {text}
      </div>
    </div>
  );
}
