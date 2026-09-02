import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { PhoneMockup } from "@/components/PhoneMockup";
import { STOPS, type Line } from "@/components/tourStops";

const PANEL_HEIGHT = "h-[56vh] sm:h-[62vh]";
const STEP_COOLDOWN_MS = 700;
const MIN_TOUCH_DELTA = 24;
const SCREEN_CYCLE_MS = 4200;

/** Same "Instagram lyric" copy and styles as the About tour used to show — a mount-based stagger, since this whole block remounts (via AnimatePresence, keyed by `active`) every time the story steps to a new stop. */
function StopLines({ lines }: { lines: Line[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
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
 * Three narrative stops (buyers, sellers, marketplace) delivered inline as
 * part of the homepage scroll — the phone sits static on the right, only
 * its inner screen crossfades; the text sits on the left and crossfades
 * with it. Each stop cycles through its own couple of phone screens on a
 * timer while it's active (e.g. buyers: play → win) — that cycling is
 * independent of the scroll gate, which only ever moves between stops.
 *
 * This isn't CSS scroll-snap (which treats up and down the same way) —
 * it's a deliberately asymmetric scroll gate:
 *   - Scrolling DOWN while the story isn't finished is intercepted and
 *     always advances exactly one stop at a time, however hard or fast you
 *     scroll — you can't skip a stop. Once you're on the last stop, the
 *     next down-scroll is let through untouched and the page continues
 *     normally into the next section.
 *   - Scrolling UP is never intercepted — it's always plain, free page
 *     scroll.
 *   - Whenever the section fully leaves the viewport in either direction,
 *     its stop resets to the first one, so scrolling back up into it later
 *     never replays the step-through — it just reappears exactly as it
 *     looked the first time the page loaded, and you scroll straight past
 *     it.
 */
export function ScrollStory() {
  const [active, setActive] = useState(0);
  const [screenIndex, setScreenIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const inViewRef = useRef(false);
  const lockedRef = useRef(false);
  const holdScrollYRef = useRef<number | null>(null);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Each stop cycles its own screens on a timer, restarting fresh at
  // screen 0 whenever the story advances to a new stop.
  useEffect(() => {
    setScreenIndex(0);
    const screens = STOPS[active]!.Screens;
    if (screens.length <= 1) return;
    const id = window.setInterval(() => {
      setScreenIndex((i) => (i + 1) % screens.length);
    }, SCREEN_CYCLE_MS);
    return () => window.clearInterval(id);
  }, [active]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry!.intersectionRatio;
        inViewRef.current = ratio >= 0.5;
        if (ratio === 0) {
          activeRef.current = 0;
          holdScrollYRef.current = null;
          setActive(0);
        }
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const advance = () => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setActive((a) => Math.min(STOPS.length - 1, a + 1));
      window.setTimeout(() => {
        lockedRef.current = false;
      }, STEP_COOLDOWN_MS);
    };

    // Belt-and-suspenders on top of preventDefault(): while the story isn't
    // finished, pin window.scrollY to wherever it was when gating engaged,
    // undoing any scroll that leaks through despite preventDefault.
    const holdScroll = () => {
      if (holdScrollYRef.current === null) holdScrollYRef.current = window.scrollY;
      if (window.scrollY !== holdScrollYRef.current) {
        window.scrollTo(window.scrollX, holdScrollYRef.current);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!inViewRef.current || e.deltaY < 5) return; // never gate upward or noise-level movement
      if (activeRef.current >= STOPS.length - 1) {
        holdScrollYRef.current = null;
        return; // story finished — let the page scroll through
      }
      e.preventDefault();
      holdScroll();
      advance();
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!inViewRef.current || activeRef.current >= STOPS.length - 1) {
        holdScrollYRef.current = null;
        return;
      }
      const y = e.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - y; // positive = finger moving up = content scrolling down
      if (delta <= MIN_TOUCH_DELTA) return;
      e.preventDefault();
      holdScroll();
      touchStartY = y;
      advance();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const current = STOPS[active]!;
  const isLast = active === STOPS.length - 1;
  const CurrentScreen = current.Screens[screenIndex % current.Screens.length]!;

  return (
    <section ref={sectionRef} className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-4 sm:pb-14 sm:pt-6">
      <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2">
        <div className={`order-1 flex ${PANEL_HEIGHT} flex-col justify-center pl-4`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-mint">{current.eyebrow}</p>
              <div className="mt-5">
                <StopLines lines={current.lines} />
              </div>
              {isLast && (
                <Link
                  to="/browse"
                  className="press mt-7 inline-block w-fit bg-mint px-7 py-3.5 text-[0.85rem] font-bold text-brand-deep"
                >
                  Browse now
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="order-2 flex justify-center">
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
    </section>
  );
}
