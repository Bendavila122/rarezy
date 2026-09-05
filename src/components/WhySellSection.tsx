import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Building2, PackageCheck, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Sparkline } from "@/components/Sparkline";

/** Counts up once its section scrolls into view, rather than on mount — the number should feel like it's landing as you read it, not have already finished before you scroll to it. */
function CountUpOnView({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [started, setStarted] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!started) return;
    let raf: number;
    const start = performance.now();
    const duration = 1100;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, to]);

  return (
    <motion.span onViewportEnter={() => setStarted(true)} viewport={{ once: true, amount: 0.6 }}>
      {value}
      {suffix}
    </motion.span>
  );
}

const TILES = [
  {
    Icon: PackageCheck,
    tint: "bg-blue-500/15 text-blue-400",
    title: "You ship, fully insured",
    body: "Only once it sells out or hits your minimum — insured, tracked, sent straight to the winner. We never take your stock, it never leaves your hands until then.",
  },
  {
    Icon: ShieldCheck,
    tint: "bg-violet-500/15 text-violet-400",
    title: "Verified sellers, real trust",
    body: "Every business is checked before approval. List something that isn't genuine and it's an instant ban, every buyer refunded in full, and you're fined what we lost in fees.",
  },
  {
    Icon: Building2,
    tint: "bg-pink-500/15 text-pink-400",
    title: "Built for real businesses",
    body: "Your own competitions, balance, payouts and fulfilment, all in one dashboard.",
  },
];

/**
 * The old plain benefits grid, now an asymmetric "bento" layout of flat
 * rounded cards with colour-coded icon badges and sparklines — matching the
 * stat-tile language used in the dashboard mock and phone section, so the
 * whole page reads as one consistent style rather than three different
 * card treatments. The hero tile leads with a real, checkable stat (a
 * typical uplift over a private sale) rather than a fabricated
 * three-way comparison an earlier version showed — these are professional
 * dealers, not first-time sellers, and a made-up precise number reads as
 * exactly that to someone who already knows their own margins.
 */
export function WhySellSection() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-amber-300">Why sell on Rarezy</p>
        <p className="mt-4 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.1rem]">
          Your stock. Your terms. Zero commission.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Reveal className="sm:col-span-2">
          <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-300">
              <TrendingUp className="h-4 w-4" strokeWidth={2} />
            </span>
            <p className="mt-4 text-[1.05rem] font-semibold tracking-tight text-white">No commission, ever</p>
            <p className="mt-2 max-w-md text-[0.82rem] leading-relaxed text-white/55">
              Sellers typically make up to 20% more on their stock than a private sale — and Rarezy takes
              nothing from it. Every fee is paid by the players, not you.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:max-w-sm">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <p className="tabular text-[1.7rem] font-black leading-none text-amber-300">
                  +<CountUpOnView to={20} suffix="%" />
                </p>
                <p className="mt-1.5 text-[0.68rem] text-white/50">Typical uplift vs. a private sale</p>
                <Sparkline color="#fbbf24" />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <p className="tabular text-[1.7rem] font-black leading-none text-white">
                  <CountUpOnView to={0} suffix="%" />
                </p>
                <p className="mt-1.5 text-[0.68rem] text-white/50">Commission, listing fees, or subscription</p>
                <Sparkline color="#9ca3af" />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <Sparkles className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-mint">
                Free
              </span>
            </div>
            <p className="mt-4 text-[0.95rem] font-semibold tracking-tight text-white">AI Marketing Centre</p>
            <p className="mt-2 flex-1 text-[0.82rem] leading-relaxed text-white/55">
              Real ad creative from your own product photos — Instagram, TikTok, email and more, generated in
              your dashboard.
            </p>
            <div className="mt-4 flex gap-1.5">
              {["Feed", "Story", "Email"].map((c) => (
                <span key={c} className="rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[0.6rem] font-medium text-amber-200">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {TILES.map((t, i) => (
          <Reveal key={t.title} delay={0.16 + i * 0.06}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.tint}`}>
                <t.Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="mt-4 text-[0.95rem] font-semibold tracking-tight text-white">{t.title}</p>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-white/55">{t.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
