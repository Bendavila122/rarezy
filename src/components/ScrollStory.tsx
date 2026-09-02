import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { PhoneMockup } from "@/components/PhoneMockup";
import { STOPS, type Line } from "@/components/tourStops";

const PANEL_HEIGHT = "h-[62vh] sm:h-[72vh]";

/** Same "Instagram lyric" copy and styles as the About tour, but replayed via whileInView (once: false) each time a stop snaps into view, instead of the tour's mount/unmount stagger — this panel never unmounts, it stays in the DOM for the native scroll-snap to work. */
function StopLines({ lines }: { lines: Line[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.6, once: false }}
          transition={{ duration: 0.4, delay: i * 0.16, ease: "easeOut" }}
          className={line.cls}
        >
          {line.text}
        </motion.p>
      ))}
    </div>
  );
}

/**
 * The homepage version of the About tour — same three stops (buyers,
 * sellers, marketplace), same lyric-style copy and phone screens, same
 * "Browse now" CTA on the final stop — but delivered inline on the scroll
 * instead of a modal. The phone is a single static element (a normal
 * sibling of the text panel, not inside it, right-hand side) so it never
 * itself scrolls; only its inner screen crossfades. The text (left-hand
 * side) lives in its own nested `overflow-y-scroll` + `snap-y
 * snap-mandatory` column with no visible controls of its own — no arrows,
 * no dots — it's meant to read as pure scroll, not a slideshow: scrolling
 * over it snaps discretely between the three stops, and once you're
 * scrolled past the last one the gesture chains naturally to the rest of
 * the page.
 */
export function ScrollStory() {
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientHeight === 0) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setActive(Math.min(STOPS.length - 1, Math.max(0, idx)));
  };

  const current = STOPS[active]!;

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-2">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className={`no-scrollbar order-1 snap-y snap-mandatory overflow-y-scroll ${PANEL_HEIGHT}`}
        >
          {STOPS.map((stop, i) => (
            <div key={stop.eyebrow} className={`flex ${PANEL_HEIGHT} snap-start flex-col justify-center`}>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-mint">{stop.eyebrow}</p>
              <div className="mt-5">
                <StopLines lines={stop.lines} />
              </div>
              {i === STOPS.length - 1 && (
                <Link
                  to="/browse"
                  className="press mt-7 inline-block w-fit bg-mint px-7 py-3.5 text-[0.85rem] font-bold text-brand-deep"
                >
                  Browse now
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="order-2 flex justify-center">
          <PhoneMockup glow={current.glow} glow2={current.glow2}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
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
        </div>
      </div>
    </section>
  );
}
