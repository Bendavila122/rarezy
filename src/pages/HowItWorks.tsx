import { Link } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Trophy, Truck } from "lucide-react";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

const STEPS = [
  {
    Icon: Truck,
    title: "1. Send us your watch",
    body: "Tell us the brand, model, reference and what you paid. Ship it in free — we cover both legs.",
  },
  {
    Icon: ShieldCheck,
    title: "2. We authenticate it",
    body: "Our partner watch specialist checks it against stolen-item registers, services the movement if needed, certifies it and photographs it — free of charge.",
  },
  {
    Icon: CheckCircle2,
    title: "3. Choose your route",
    body: "Take an instant cash offer, deposited within 48 hours. Or list it with a ticket price for a higher ceiling, and wait for players to enter.",
  },
  {
    Icon: Trophy,
    title: "4. It's won on skill",
    body: "No random draws. Every entrant pays the ticket price plus a 50% processing fee at checkout, then plays a full tile-merging match — sliding and combining matching watch-brand tiles up the ladder — whoever tops the leaderboard when the deadline hits wins the watch.",
  },
];

export function HowItWorks() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">How Rarezy works</h1>
      <p className="mt-3 max-w-lg text-[0.9rem] leading-relaxed text-muted">
        Two ways to sell a luxury watch: take the money now, or put it up for a shot at more.
        Either way, it's authenticated, certified and insured before anyone sees it.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {STEPS.map(({ Icon, title, body }) => (
          <div key={title} className="card flex gap-4 p-5">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={1.7} />
            <div>
              <p className="text-[0.9rem] font-medium tracking-tight">{title}</p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <p className={labelCls}>If the minimum isn't reached</p>
        <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
          A listing can close without hitting the minimum you set. When that happens, nothing
          is decided for you — you choose to accept whatever was raised, take a first-refusal cash
          offer from our partner watch specialist, relist for a fresh deadline, or have the watch
          shipped straight back.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/sell"
          className="rounded-none bg-brand px-6 py-3.5 text-[0.9rem] font-medium tracking-tight text-background transition-transform active:scale-[0.97]"
        >
          Sell your watch
        </Link>
        <Link
          to="/help"
          className="rounded-none border border-white/12 px-6 py-3.5 text-[0.9rem] font-medium tracking-tight transition-transform active:scale-[0.97]"
        >
          Read the FAQ
        </Link>
      </div>
    </div>
  );
}
