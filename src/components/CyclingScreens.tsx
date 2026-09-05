import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** Auto-advances through a fixed set of phone screens on a timer — the same per-stop cycling `ScrollStory` does, pulled out standalone for pages that just want one cycling phone with no scroll-linked story around it. */
export function CyclingScreens({
  screens,
  intervalMs = 3200,
}: {
  screens: Array<() => React.JSX.Element>;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (screens.length <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % screens.length), intervalMs);
    return () => window.clearInterval(id);
  }, [screens.length, intervalMs]);

  const Screen = screens[index % screens.length]!;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Screen />
      </motion.div>
    </AnimatePresence>
  );
}
