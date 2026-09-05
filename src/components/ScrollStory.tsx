import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { PhoneMockup } from "@/components/PhoneMockup";
import { STOPS, type Line } from "@/components/tourStops";

const SCREEN_CYCLE_MS = 4200;

/** Same "Instagram lyric" copy and styles as the About tour used to show — replayed via whileInView (once: false) each time a stop scrolls into view, since every stop stays mounted in the DOM (this is real page scroll, not a simulation). */
function StopLines({ lines }: { lines: Line[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.6, once: false }}
          transition={{ duration: 0.4, delay: i * 0.12, ease: "easeOut" }}
          className={line.cls}
        >
          {line.text}
        </motion.p>
      ))}
    </div>
  );
}

/**
 * Two narrative stops (buyers, marketplace) — this page is buyer-facing
 * only, so the old seller stop moved to its own "Rarezy for Businesses"
 * page. Each stop is a real, full-height block in normal page flow — no
 * scroll-jacking, no JS gating. Scrolling down moves through each stop in
 * turn, exactly like scrolling down any ordinary page (each stop is a
 * `snap-start` point in the home page's shared scroll-snap set); scrolling
 * up reverses through the exact same stops. You can only continue on into
 * the game section once you've scrolled past the last stop (marketplace).
 *
 * The one deliberately special thing: on larger screens the phone is
 * `position: sticky` within this whole block, so it stays visually still
 * on screen while the text scrolls normally past it. Each stop also
 * cycles through a couple of its own phone screens on a timer while it's
 * the one in view (e.g. buyers: play → win).
 */
export function ScrollStory() {
  const [active, setActive] = useState(0);
  const [screenIndex, setScreenIndex] = useState(0);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = panelRefs.current.indexOf(entry.target as HTMLDivElement);
          if (idx !== -1) setActive(idx);
        }
      },
      { threshold: 0.5 },
    );
    panelRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Each stop cycles its own screens on a timer, restarting fresh at
  // screen 0 whenever a new stop scrolls into view.
  useEffect(() => {
    setScreenIndex(0);
    const screens = STOPS[active]!.Screens;
    if (screens.length <= 1) return;
    const id = window.setInterval(() => {
      setScreenIndex((i) => (i + 1) % screens.length);
    }, SCREEN_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [active]);

  const current = STOPS[active]!;
  const CurrentScreen = current.Screens[screenIndex % current.Screens.length]!;

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
      <div className="grid grid-cols-1 items-start gap-10 sm:grid-cols-2">
        <div className="order-2 sm:order-1">
          {STOPS.map((stop, i) => (
            <div
              key={stop.eyebrow}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="flex min-h-[calc(100vh-4rem)] snap-start scroll-mt-16 flex-col justify-center pl-4 sm:pl-12"
            >
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-mint">{stop.eyebrow}</p>
              <div className="mt-5">
                <StopLines lines={stop.lines} />
              </div>
              {i === 0 && (
                <Link
                  to="/browse"
                  className="press mt-7 inline-block w-fit bg-mint px-7 py-3.5 text-[0.85rem] font-bold text-brand-deep"
                >
                  Browse competitions
                </Link>
              )}
              {i === STOPS.length - 1 && (
                <button
                  type="button"
                  onClick={() => document.getElementById("game-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="press mt-7 inline-block w-fit bg-mint px-7 py-3.5 text-[0.85rem] font-bold text-brand-deep"
                >
                  Try out the game
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="order-1 flex items-center justify-center pb-6 pt-6 sm:order-2 sm:sticky sm:top-16 sm:h-[calc(100vh-4rem)] sm:pb-0 sm:pt-0">
          <PhoneMockup glow={current.glow} glow2={current.glow2}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${active}-${screenIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <CurrentScreen />
              </motion.div>
            </AnimatePresence>
          </PhoneMockup>
        </div>
      </div>
    </div>
  );
}
