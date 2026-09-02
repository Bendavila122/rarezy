import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { tourState, useTourState } from "@/lib/tourState";

const KEY = "rarezy.tour-hint-seen";

/** A one-time speech bubble pointing at the About tab, nudging first-time visitors toward the explainer tour. Shown once per browser, dismissed by closing it, clicking it, or opening the tour any other way. */
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
    <div className="absolute left-0 top-full z-40 mt-3 w-60">
      <div className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 border-l border-t border-white/15 bg-[#1c1c1e]" />
      <div className="glass-dark relative border border-white/15 p-4 pr-8">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-2 top-2 text-white/40 transition-colors hover:text-white"
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
    </div>
  );
}
