import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

/**
 * A "keep scrolling" cue for the snap-scrolling hero only (the buyers and
 * marketplace stops) — it fades out as soon as the visitor scrolls past
 * that section into the rest of the ordinary, non-snapping page, rather
 * than following them all the way down.
 */
export function ScrollHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const story = document.getElementById("scroll-story");
      const bottom = story ? story.offsetTop + story.offsetHeight : 0;
      setVisible(window.scrollY < bottom - window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]"
          >
            <ChevronDown className="h-4 w-4 text-white/40" strokeWidth={2} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
