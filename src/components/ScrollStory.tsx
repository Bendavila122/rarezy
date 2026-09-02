import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { PhoneMockup } from "@/components/PhoneMockup";
import { STOPS, type Line } from "@/components/tourStops";

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
 * its inner screen crossfades; the text sits on the left and slides with
 * it. Each stop cycles through its own couple of phone screens on a timer
 * while it's active (e.g. buyers: play → win) — that cycling is
 * independent of the scroll gate, which only ever moves between stops.
 *
 * This isn't CSS scroll-snap (which can't keep a single element static
 * across "pages") — it's a symmetric scroll gate: scrolling either
 * direction is intercepted and always moves exactly one stop at a time,
 * however hard or fast you scroll, in either direction. Once you're past
 * either end (scrolling down from the last stop, or up from the first),
 * the next matching scroll is let through untouched and the page
 * continues normally — down into the next section, or up toward the
 * search bar. This block itself is one snap-aligned "page" in the
 * page-wide scroll-snap set up in Home.tsx, so its stepping is a purely
 * internal, JS-driven affair that never itself moves window.scrollY.
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
  // screen 0 whenever the story moves to a new stop.
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
        inViewRef.current = entry!.intersectionRatio >= 0.5;
      },
      { threshold: [0, 0.5] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const step = (dir: 1 | -1) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setActive((a) => Math.min(STOPS.length - 1, Math.max(0, a + dir)));
      window.setTimeout(() => {
        lockedRef.current = false;
      }, STEP_COOLDOWN_MS);
    };

    // Belt-and-suspenders on top of preventDefault(): while gating, pin
    // window.scrollY to wherever it was when gating engaged, undoing any
    // scroll that leaks through despite preventDefault.
    const holdScroll = () => {
      if (holdScrollYRef.current === null) holdScrollYRef.current = window.scrollY;
      if (window.scrollY !== holdScrollYRef.current) {
        window.scrollTo(window.scrollX, holdScrollYRef.current);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!inViewRef.current || Math.abs(e.deltaY) < 5) return; // ignore noise-level movement
      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      const atEdge = dir === 1 ? activeRef.current >= STOPS.length - 1 : activeRef.current <= 0;
      if (atEdge) {
        holdScrollYRef.current = null;
        return; // at this end of the story — let the page scroll through
      }
      e.preventDefault();
      holdScroll();
      step(dir);
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!inViewRef.current) return;
      const y = e.touches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - y; // positive = finger moving up = content scrolling down
      if (Math.abs(delta) <= MIN_TOUCH_DELTA) return;
      const dir: 1 | -1 = delta > 0 ? 1 : -1;
      const atEdge = dir === 1 ? activeRef.current >= STOPS.length - 1 : activeRef.current <= 0;
      if (atEdge) {
        holdScrollYRef.current = null;
        return;
      }
      e.preventDefault();
      holdScroll();
      touchStartY = y;
      step(dir);
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
    <section ref={sectionRef} className="relative z-10 flex min-h-0 w-full flex-1 flex-col px-6">
      <div className="mx-auto grid h-full w-full max-w-6xl grid-cols-1 items-center gap-10 sm:grid-cols-2">
        <div className="order-1 relative h-full overflow-hidden pl-4">
          <AnimatePresence initial={false}>
            <motion.div
              key={active}
              className="absolute inset-0 flex flex-col justify-center"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
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

        <div className="order-2 flex h-full items-center justify-center pb-6">
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
