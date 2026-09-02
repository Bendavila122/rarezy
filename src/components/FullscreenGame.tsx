import { createPortal } from "react-dom";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Takes a real, ticket-spending game attempt full-screen — no card, no page
 * chrome, nothing to accidentally scroll past. Portalled to `document.body`
 * so it always covers the entire viewport regardless of where it's mounted
 * in the tree. There's deliberately no close control here: once an attempt
 * starts, the confirmation step already warned it can't be replayed, so the
 * only way out is finishing the match or using its own "Bank score & end".
 */
export function FullscreenGame({ title, children }: { title: string; children: ReactNode }) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="glass-dark w-full max-w-md rounded-none p-5 shadow-2xl sm:p-7"
      >
        <p className="text-center text-[0.62rem] uppercase tracking-[0.24em] text-muted">{title}</p>
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
