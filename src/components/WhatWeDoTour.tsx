import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { PhoneMockup } from "@/components/PhoneMockup";
import { BrowseScreen, PaidScreen, PlayScreen } from "@/components/WalkthroughScreens";
import { tourState, TOUR_PHONE_LAYOUT_ID, useTourState } from "@/lib/tourState";

/** "Instagram lyric" text styles — short fragments at wildly different sizes/weights/fonts so the copy reads like it's being spoken aloud rather than sitting as one flat paragraph. */
const BASE = "text-[1.05rem] sm:text-[1.15rem] font-medium text-white/60";
const MID = "text-[1.35rem] sm:text-[1.55rem] font-bold text-white";
const HUGE =
  "text-[2.6rem] sm:text-[3.6rem] font-black italic leading-[0.95] text-mint [font-family:var(--font-display)]";
const AMBER = "text-[2rem] sm:text-[2.6rem] font-extrabold leading-[1.05] text-amber-300";

type Line = { text: string; cls: string };

type Stop = {
  eyebrow: string;
  Screen: () => React.JSX.Element;
  glow: string;
  glow2: string;
  lines: Line[];
};

const STOPS: Stop[] = [
  {
    eyebrow: "For buyers",
    Screen: PlayScreen,
    glow: "oklch(0.82 0.19 148)",
    glow2: "oklch(0.82 0.16 80)",
    lines: [
      { text: "We give you the chance to", cls: BASE },
      { text: "WIN", cls: HUGE },
      { text: "a luxury item worth", cls: BASE },
      { text: "£500+", cls: AMBER },
      { text: "for as little as", cls: BASE },
      { text: "£1", cls: HUGE },
      { text: "Play a quick skill game.", cls: MID },
      { text: "See your rank", cls: MID },
      { text: "INSTANTLY.", cls: AMBER },
      { text: "Hundreds of items to choose from.", cls: BASE },
    ],
  },
  {
    eyebrow: "For sellers",
    Screen: PaidScreen,
    glow: "oklch(0.75 0.19 80)",
    glow2: "oklch(0.82 0.19 148)",
    lines: [
      { text: "Got something valuable?", cls: BASE },
      { text: "List it once.", cls: MID },
      { text: "We authenticate it,", cls: BASE },
      { text: "completely free.", cls: MID },
      { text: "Earn MORE", cls: HUGE },
      { text: "than a private sale or dealer trade-in.", cls: BASE },
      { text: "Or take an", cls: BASE },
      { text: "INSTANT CASH OFFER", cls: AMBER },
      { text: "any time — no extra cost.", cls: BASE },
    ],
  },
  {
    eyebrow: "The marketplace",
    Screen: BrowseScreen,
    glow: "oklch(0.82 0.19 148)",
    glow2: "oklch(0.75 0.19 80)",
    lines: [
      { text: "One marketplace.", cls: MID },
      { text: "Every item,", cls: BASE },
      { text: "independently authenticated.", cls: MID },
      { text: "Watches. Jewellery. Bags. Sneakers.", cls: MID },
      { text: "New competitions", cls: BASE },
      { text: "EVERY DAY.", cls: HUGE },
      { text: "Better odds, better prices,", cls: BASE },
      { text: "for EVERYONE.", cls: AMBER },
    ],
  },
];

function LyricLines({ lines }: { lines: Line[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.16, ease: "easeOut" }}
          className={line.cls}
        >
          {line.text}
        </motion.p>
      ))}
    </div>
  );
}

export function WhatWeDoTour() {
  const { open } = useTourState();
  const [stop, setStop] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setStop(0);
  }, [open]);

  // Auto-advance every 15s — manual prev/next/dot clicks also change `stop`,
  // which restarts this timer so a slide always gets its full 15s after the
  // visitor last touched it. Past the final stop, close and return home.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      if (stop < STOPS.length - 1) {
        setStop((s) => s + 1);
      } else {
        tourState.close();
        navigate("/");
      }
    }, 15_000);
    return () => window.clearTimeout(id);
  }, [open, stop, navigate]);

  if (typeof document === "undefined") return null;

  const current = STOPS[stop]!;
  const isLast = stop === STOPS.length - 1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-2xl"
          onClick={() => tourState.close()}
        >
          <button
            type="button"
            onClick={() => tourState.close()}
            aria-label="Close"
            className="press absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center bg-white/10 text-white"
          >
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>

          <div
            className="relative mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid w-full grid-cols-1 items-center gap-10 sm:grid-cols-2 sm:gap-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stop}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-mint">
                    {current.eyebrow}
                  </p>
                  <div className="mt-5">
                    <LyricLines lines={current.lines} />
                  </div>
                  {isLast && (
                    <button
                      type="button"
                      onClick={() => {
                        tourState.close();
                        navigate("/browse");
                      }}
                      className="press mt-7 inline-block bg-mint px-7 py-3.5 text-[0.85rem] font-bold text-brand-deep"
                    >
                      Browse now
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Same layoutId as the hero's phone (hidden while the tour is open) — Framer
                  animates the handoff between the two, so it reads as one phone popping out
                  of the hero rather than a second one appearing. Stays mounted across stops;
                  only the screen content inside crossfades. */}
              <div className="order-first flex justify-center sm:order-last">
                <motion.div
                  layoutId={TOUR_PHONE_LAYOUT_ID}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PhoneMockup glow={current.glow} glow2={current.glow2}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={stop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <current.Screen />
                      </motion.div>
                    </AnimatePresence>
                  </PhoneMockup>
                </motion.div>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <button
                type="button"
                onClick={() => setStop((s) => Math.max(0, s - 1))}
                disabled={stop === 0}
                aria-label="Previous"
                className="press flex h-9 w-9 items-center justify-center bg-white/10 text-white disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
              </button>

              <div className="flex items-center gap-2">
                {STOPS.map((s, i) => (
                  <button
                    key={s.eyebrow}
                    type="button"
                    onClick={() => setStop(i)}
                    aria-label={`Go to ${s.eyebrow}`}
                    className={`h-1.5 transition-all ${i === stop ? "w-6 bg-mint" : "w-1.5 bg-white/25"}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStop((s) => Math.min(STOPS.length - 1, s + 1))}
                disabled={isLast}
                aria-label="Next"
                className="press flex h-9 w-9 items-center justify-center bg-white/10 text-white disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
