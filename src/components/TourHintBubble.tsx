import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { tourState, useTourState } from "@/lib/tourState";

const KEY = "rarezy.tour-hint-seen";

/** A one-time floating glass "liquid" bubble pointing at the About tab, nudging first-time visitors toward the explainer tour. Shown once per browser, dismissed by closing it, clicking it, clicking the About tab, or opening the tour any other way. */
export function TourHintBubble() {
  const { open } = useTourState();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let seen = true;
    try {
      seen = Boolean(localStorage.getItem(KEY));
    } catch {
      /* private browsing — just don't nag if we can't remember */
    }
    if (seen) return;
    const id = window.setTimeout(() => setVisible(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (open) dismiss();
  }, [open]);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* private browsing — nothing to persist, it'll just ask again next visit */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="absolute left-0 top-full z-40 mt-5 w-60">
      {/* A trail of liquid droplets rising from the blob toward the About tab above. */}
      <span className="glass-block absolute -top-5 left-8 h-2 w-2 rounded-full" />
      <span className="glass-block absolute -top-8 left-9 h-1.5 w-1.5 rounded-full" />

      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="glass-block relative p-4 pr-8"
          style={{ borderRadius: "42% 58% 55% 45% / 45% 40% 60% 55%", animation: "liquid-wobble 8s ease-in-out infinite" }}
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-3 top-3 text-white/40 transition-colors hover:text-white"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => tourState.open()}
            className="press text-left text-[0.82rem] leading-relaxed text-white/85"
          >
            👋 New here? Take a quick tour to see what we actually do.
          </button>
        </div>
      </motion.div>
    </div>
  );
}
