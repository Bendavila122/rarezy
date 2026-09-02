import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * The one scroll-reveal every major section on Home uses — a pronounced
 * upward swipe + fade, once per element, so the page has a consistent
 * cinematic rhythm as you scroll rather than content just appearing.
 */
export function SwipeUp({
  children,
  delay = 0,
  distance = 48,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
