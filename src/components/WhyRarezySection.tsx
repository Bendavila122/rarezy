import { BadgeCheck, CalendarDays, Gem, LayoutGrid, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const POINTS = [
  {
    Icon: BadgeCheck,
    title: "Authenticated, always",
    body: "Every item is independently checked by our partner specialists before it ever goes live.",
  },
  {
    Icon: TrendingUp,
    title: "Sellers earn more",
    body: "Ticketed entries routinely beat a private sale or a dealer's lowball trade-in offer.",
  },
  {
    Icon: CalendarDays,
    title: "Win something every day",
    body: "New competitions close daily, across every category — there's always a fresh one live.",
  },
  {
    Icon: LayoutGrid,
    title: "Way beyond watches",
    body: "Jewellery, bags, sneakers and more — find the exact item you're after, not just what's left.",
  },
  {
    Icon: Wallet,
    title: "Cash, if you'd rather not wait",
    body: "Take an instant cash offer any time — including automatically if a listing doesn't hit its minimum by the deadline. Relist or cash out, at no extra cost either way.",
  },
  {
    Icon: ShieldCheck,
    title: "Insured, every step",
    body: "Free shipping both ways, and every item held in insured safe deposit from the moment it arrives until a winner's decided.",
  },
] as const;

/**
 * The platform-level pitch, sitting between the buyer/seller persona
 * stories and the game itself — ties both sides together (sellers get a
 * better price, buyers get authenticated variety) rather than repeating
 * either story on its own.
 */
export function WhyRarezySection() {
  return (
    <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-6 py-20">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="flex items-center justify-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.32em] text-mint">
          <Gem className="h-3.5 w-3.5" strokeWidth={2.4} />
          Why Rarezy
        </p>
        <p className="mt-4 text-[1.9rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.5rem]">
          A better deal for both sides.
        </p>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-white/55 sm:text-[1rem]">
          Sellers list once and earn more than a private sale ever would. Buyers get a much wider
          range than watches alone — authenticated, and won on skill, not luck.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {POINTS.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.08} y={20}>
            <div className="glass-dark group relative h-full overflow-hidden p-6">
              {/* Static diagonal sheen, like light catching a glass pane at rest. */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(1 0 0 / 12%) 0%, transparent 32%, transparent 68%, oklch(1 0 0 / 5%) 100%)",
                }}
              />
              {/* A brighter shine sweeps across on hover, selling the reflective-glass feel. */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-white/15 transition-transform duration-700 ease-out group-hover:translate-x-[320%]" />
              </div>
              <div className="relative z-[1]">
                <span className="flex h-9 w-9 items-center justify-center bg-mint/10">
                  <p.Icon className="h-4 w-4 text-mint" strokeWidth={2} />
                </span>
                <p className="mt-4 text-[0.95rem] font-semibold tracking-tight text-white">{p.title}</p>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-white/55">{p.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
