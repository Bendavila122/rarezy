import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

function haptic(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* silent */
    }
  }
}

/**
 * The skill element behind every competition entry: stop a sweeping marker
 * inside the lit zone. No randomness in who wins — only in where the zone
 * sits each attempt.
 */
export function SkillGame({ onComplete }: { onComplete: (score: number) => void }) {
  const pos = useMotionValue(0);
  const controls = useRef<ReturnType<typeof animate> | null>(null);
  const [target] = useState(() => 20 + Math.random() * 60);
  const zoneWidth = 12;
  const [result, setResult] = useState<{ score: number; hit: boolean } | null>(null);
  const left = useTransform(pos, (v) => `calc(${v}% - 2px)`);

  useEffect(() => {
    controls.current = animate(pos, [4, 96, 4], {
      duration: 1.7,
      repeat: Infinity,
      ease: "easeInOut",
    });
    return () => controls.current?.stop();
  }, [pos]);

  const lock = () => {
    if (result) return;
    controls.current?.stop();
    haptic([10, 30, 10]);
    const v = pos.get();
    const distance = Math.abs(v - target);
    const hit = distance <= zoneWidth / 2;
    const score = Math.max(0, Math.min(1000, Math.round(1000 - distance * 11 + (hit ? 120 : 0))));
    setResult({ score, hit });
    window.setTimeout(() => onComplete(score), 1100);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted">Stop it in the light</p>

      <div className="relative h-3 w-full overflow-visible rounded-full bg-white/8">
        <div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${target - zoneWidth / 2}%`,
            width: `${zoneWidth}%`,
            background: "oklch(0.78 0.13 82 / 45%)",
            boxShadow: "0 0 16px oklch(0.78 0.13 82 / 55%)",
          }}
        />
        <motion.div
          aria-hidden
          style={{ left }}
          className="absolute -top-1.5 h-6 w-1 rounded-full bg-foreground shadow-[0_0_10px_oklch(1_0_0/60%)]"
        />
      </div>

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-1"
        >
          <p className="tabular text-[2.1rem] font-semibold leading-none tracking-[-0.04em] text-gold">
            {result.score}
          </p>
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">
            {result.hit ? "Direct hit" : "Recorded"}
          </p>
        </motion.div>
      ) : (
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={lock}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-[0.62rem] font-medium uppercase tracking-[0.18em] text-background"
        >
          Stop
        </motion.button>
      )}
    </div>
  );
}
