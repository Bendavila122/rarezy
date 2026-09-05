import { useEffect, useState } from "react";
import { BarChart3, LayoutDashboard, Sparkles } from "lucide-react";
import { PhoneMockup } from "@/components/PhoneMockup";
import { Reveal } from "@/components/Reveal";

const FEATURES = [
  {
    Icon: LayoutDashboard,
    title: "Full seller dashboard",
    body: "Competitions, fulfilment, balance — everything you need to run your shop, in one place.",
  },
  {
    Icon: Sparkles,
    title: "AI Marketing Centre",
    body: "Turn your own product photos into ad creative for every channel, generated free.",
  },
  {
    Icon: BarChart3,
    title: "Real-time analytics",
    body: "Track views, entries and revenue across every listing you've got live, updated as it happens.",
  },
];

/** One entry in the live ticker strip beneath the phone — its number gently climbs on its own, the same "this is live" trick real product screenshots use instead of a frozen figure. */
function TickerStat({
  label,
  start,
  step,
  prefix = "",
  format = (n: number) => n.toLocaleString("en-GB"),
}: {
  label: string;
  start: number;
  step: [number, number];
  prefix?: string;
  format?: (n: number) => string;
}) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    const id = window.setInterval(
      () => setValue((v) => v + step[0] + Math.random() * (step[1] - step[0])),
      1400 + Math.random() * 900,
    );
    return () => window.clearInterval(id);
  }, [step]);

  return (
    <div className="flex-1 px-4 py-3.5 text-center first:pl-0 last:pr-0 sm:text-left">
      <p className="tabular text-[1.15rem] font-bold leading-none text-white">
        {prefix}
        {format(Math.round(value))}
      </p>
      <p className="mt-1.5 text-[0.64rem] uppercase tracking-[0.14em] text-white/40">{label}</p>
    </div>
  );
}

/**
 * Rarezy's own 3D phone mockup (the same one used site-wide, not a flat
 * laid-down frame) next to a simple icon-led feature list, with the live
 * figures pulled out into a single ticker strip beneath the phone rather
 * than individual cards floating around its edges — an earlier version's
 * flat-phone-plus-scattered-floating-stat-cards composition read too close
 * to a specific competitor's own dashboard visual, so this keeps the same
 * "live product" feeling through different structure.
 */
export function PhoneFeatureSection() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-amber-300">Your toolkit</p>
        <p className="mt-4 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.1rem]">
          One dashboard. Everything, live.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 items-center gap-10 sm:grid-cols-2">
        <Reveal className="flex flex-col items-center">
          <PhoneMockup glow="oklch(0.75 0.19 80)" glow2="oklch(0.82 0.19 148)">
            <div className="relative h-full w-full">
              <img src="/watches/rolex-datejust-126234-sunburst.jpg" alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-3">
                <span className="text-[0.62rem] font-bold text-white">Rarezy</span>
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-mint" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                <p className="text-[0.78rem] font-bold text-white">Rolex Datejust 126234</p>
                <p className="text-[0.62rem] text-white/70">£5.00 · 1,480 entries</p>
              </div>
            </div>
          </PhoneMockup>

          <div className="mt-10 flex w-full max-w-xs divide-x divide-white/10 border-y border-white/10 sm:max-w-sm">
            <TickerStat label="Revenue" start={7400} step={[4, 22]} prefix="£" />
            <TickerStat label="Entries" start={1480} step={[1, 4]} />
            <TickerStat label="Views" start={9200} step={[6, 30]} />
          </div>
        </Reveal>

        <div className="flex flex-col gap-8">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/12">
                  <f.Icon className="h-4 w-4 text-amber-300" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[1rem] font-semibold tracking-tight text-white">{f.title}</p>
                  <p className="mt-1.5 text-[0.85rem] leading-relaxed text-white/55">{f.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
