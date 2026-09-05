import { Gamepad2, Search, Ticket, Trophy } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const STEPS = [
  {
    Icon: Search,
    tint: "bg-blue-500/15 text-blue-400",
    title: "Pick a watch",
    body: "Browse live competitions across every brand and budget — every piece is genuine, checked before it ever goes live.",
  },
  {
    Icon: Ticket,
    tint: "bg-violet-500/15 text-violet-400",
    title: "Buy tickets",
    body: "From a couple of pounds each, no limit on how many. More tickets, more attempts at the game.",
  },
  {
    Icon: Gamepad2,
    tint: "bg-amber-500/15 text-amber-300",
    title: "Play the game",
    body: "One quick round of skill per ticket. No luck of the draw — your score is what puts you on the board.",
  },
  {
    Icon: Trophy,
    tint: "bg-mint/15 text-mint",
    title: "Highest score wins",
    body: "Top of the leaderboard when the clock runs out takes the watch home, fully insured to your door.",
  },
];

/**
 * A connected icon-badge timeline, same structure as the "From application
 * to payout" section on Rarezy for Businesses — a mint-and-varied-tint set
 * of stat badges on a thin connecting line, rather than a repeat of the
 * scroll-story narrative above it. Gives buyers the same plain, scannable
 * "here's exactly how this works" beat sellers already get.
 */
export function HowToWinSection() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-mint">How it works</p>
        <p className="mt-4 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.1rem]">
          From browsing to winning.
        </p>
      </Reveal>

      <div className="relative mt-14">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/10 sm:block" />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} y={20}>
              <div className="relative flex flex-col items-start">
                <span className={`relative z-[1] flex h-12 w-12 items-center justify-center rounded-full ${s.tint}`}>
                  <s.Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="mt-4 text-[0.95rem] font-semibold tracking-tight text-white">{s.title}</p>
                <p className="mt-1.5 text-[0.8rem] leading-relaxed text-white/55">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
