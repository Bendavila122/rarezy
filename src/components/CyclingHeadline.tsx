import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

export type HeadlineVariant = { text: string; className: string; style?: CSSProperties | undefined };

const TYPE_MS = 45;
const DELETE_MS = 25;
const HOLD_MS = 1900;

/**
 * A hero headline that rotates through a few differently-styled variants —
 * a different font, weight, case and tracking each time, not just different
 * copy — by actually typing each one out and backspacing it, not
 * crossfading between two static blocks like a slideshow. An earlier
 * version crossfaded; the correction was explicit: it should read as being
 * typed, the way `FaqSection`'s question bubbles already do elsewhere on
 * the site.
 *
 * The fixed-height wrapper still matters even though there's only ever one
 * `<h1>` now — typing character-by-character can grow the text onto a
 * second line partway through, and reserving the taller height up front
 * stops that from shoving the button row below it down mid-type.
 */
export function CyclingHeadline({
  variants,
  minHeightClassName = "min-h-[5.6rem] sm:min-h-[7.4rem]",
}: {
  variants: HeadlineVariant[];
  minHeightClassName?: string;
}) {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  const v = variants[index % variants.length]!;

  useEffect(() => {
    if (phase === "typing") {
      if (count < v.text.length) {
        const id = window.setTimeout(() => setCount((c) => c + 1), TYPE_MS);
        return () => window.clearTimeout(id);
      }
      if (variants.length <= 1) return; // nothing to cycle to — leave it typed
      const id = window.setTimeout(() => setPhase("deleting"), HOLD_MS);
      return () => window.clearTimeout(id);
    }
    if (count > 0) {
      const id = window.setTimeout(() => setCount((c) => c - 1), DELETE_MS);
      return () => window.clearTimeout(id);
    }
    setIndex((i) => (i + 1) % variants.length);
    setPhase("typing");
  }, [phase, count, v.text.length, variants.length]);

  return (
    <div className={`relative ${minHeightClassName}`}>
      <h1 className={v.className} style={v.style ?? {}}>
        {v.text.slice(0, count)}
        <span className="animate-pulse">▌</span>
      </h1>
    </div>
  );
}
