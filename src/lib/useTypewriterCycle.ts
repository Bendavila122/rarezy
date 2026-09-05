import { useEffect, useState } from "react";

const TYPE_SPEED = 45;
const CLEAR_SPEED = 18;
const HOLD_MS = 1700;

/** Types out the current phrase, waits, deletes it, then advances to the next — a loop-friendly single-phrase typewriter, used for search placeholder text. */
export function useTypewriterCycle(phrases: readonly string[]) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const text = phrases[index] ?? "";
    if (!clearing) {
      if (display.length < text.length) {
        const id = window.setTimeout(() => setDisplay(text.slice(0, display.length + 1)), TYPE_SPEED);
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => setClearing(true), HOLD_MS);
      return () => window.clearTimeout(id);
    }
    if (display.length > 0) {
      const id = window.setTimeout(() => setDisplay((d) => d.slice(0, -1)), CLEAR_SPEED);
      return () => window.clearTimeout(id);
    }
    setClearing(false);
    setIndex((i) => (i + 1) % phrases.length);
    return undefined;
  }, [display, clearing, index, phrases]);

  return display;
}
