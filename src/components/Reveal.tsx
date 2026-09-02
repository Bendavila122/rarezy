import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * A one-time "pop up" entrance for anything scrolled into view — fades and
 * rises (with a slight scale pop) the first time it crosses into the
 * viewport, then leaves it alone. Used across the home page's sections so
 * scrolling down feels like content is arriving, not just sitting there.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
  amount = 0.25,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  amount?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
