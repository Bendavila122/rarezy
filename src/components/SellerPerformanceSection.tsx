import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import { Reveal } from "@/components/Reveal";

/** Generic count-up, unlike `WalkthroughScreens`' `CountUp` which always formats as GBP — these stats are a percentage and a day count, not money. */
function AnimatedNumber({ to, duration = 900 }: { to: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{value}</>;
}

// Illustrative example of one competition's entries selling through over its
// four-week run — not a live feed, just a concrete shape for "demand builds
// once the marketing kicks in" rather than an abstract claim.
const WEEKS = [
  { label: "Week 1", pct: 22 },
  { label: "Week 2", pct: 48 },
  { label: "Week 3", pct: 74 },
  { label: "Week 4", pct: 100 },
];

const STATS = [
  { to: 0, prefix: "£", suffix: "", label: "Listing fees" },
  { to: 0, prefix: "", suffix: "%", label: "Commission on what you raise" },
  { to: 2, prefix: "", suffix: " days", label: "Typical approval time" },
] as const;

function BarChartCard() {
  return (
    <div className="glass-dark p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/50">Example competition</p>
          <p className="mt-1 text-[0.95rem] font-semibold text-white">Entries sold over a 4-week run</p>
        </div>
        <span className="flex items-center gap-1 rounded-none bg-amber-400/12 px-2.5 py-1 text-[0.7rem] font-semibold text-amber-300">
          <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.4} />
          Sold out
        </span>
      </div>

      {/* Each bar is `absolute bottom-0` inside an `h-full` column that sits
          in the `h-40` row — giving the animated `height: X%` a definite
          pixel height to resolve against. A percentage height on a bar
          nested directly in a flex column with no explicit height of its
          own is a height of nothing to be a percentage *of*, so it silently
          computes to 0 despite the inline style looking correct. */}
      <div className="mt-8 flex h-40 items-end gap-4">
        {WEEKS.map((w, i) => (
          <div key={w.label} className="relative h-full flex-1">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${w.pct}%` }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 w-full rounded-t-sm bg-gradient-to-t from-amber-500 to-amber-300"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-4">
        {WEEKS.map((w) => (
          <p key={w.label} className="flex-1 text-center text-[0.62rem] text-white/45">
            {w.label}
          </p>
        ))}
      </div>
    </div>
  );
}

/** A concrete "here's what selling on Rarezy looks like" section — an illustrative demand chart plus the headline platform numbers, sitting between the benefits grid and the marketing centre showcase. */
export function SellerPerformanceSection() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-amber-300">Real numbers</p>
          <p className="mt-4 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.1rem]">
            Demand builds fast once it's live.
          </p>
          <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-white/60">
            A typical competition sells through steadily across its run as entries and marketing compound —
            no discounting required to move it.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="tabular text-[1.6rem] font-bold leading-none text-white sm:text-[1.9rem]">
                  {s.prefix}
                  <AnimatedNumber to={s.to} />
                  {s.suffix}
                </p>
                <p className="mt-2 text-[0.72rem] leading-snug text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <BarChartCard />
        </Reveal>
      </div>
    </div>
  );
}
