import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

/** Animates a number from 0 up to `value` once it scrolls into view. */
export function CountUp({
  value,
  format = (n) => String(n),
  duration = 1.6,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className="tabular">
      {format(display)}
    </span>
  );
}
