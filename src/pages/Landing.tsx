import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Gem, ShieldCheck, Trophy, Truck } from "lucide-react";

export function Landing() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[0.62rem] uppercase tracking-[0.32em] text-gold">More4Me</p>
        <h1 className="mt-4 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.03em]">
          Win it, don't wait for it.
        </h1>
        <p className="mt-5 max-w-lg text-[1rem] leading-relaxed text-muted">
          Sell your luxury item for an instant cash offer — or enter it into a skill-based
          competition where players compete for a shot at owning it. Authenticated, certified and
          insured, from a watch to a handbag.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/sell"
            className="rounded-full bg-gold px-6 py-3.5 text-[0.9rem] font-medium tracking-tight text-background transition-transform active:scale-[0.97]"
          >
            Sell something
          </Link>
          <Link
            to="/browse"
            className="rounded-full border border-white/12 px-6 py-3.5 text-[0.9rem] font-medium tracking-tight transition-transform active:scale-[0.97]"
          >
            Browse competitions
          </Link>
        </div>
      </motion.div>

      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          {
            Icon: Truck,
            title: "Ship it in, free",
            body: "We cover shipping both ways. Our partner jeweller authenticates, certifies and photographs it.",
          },
          {
            Icon: ShieldCheck,
            title: "Held, insured",
            body: "Every item sits in a safe deposit, fully insured, until a winner is decided.",
          },
          {
            Icon: Trophy,
            title: "Won on skill",
            body: "No random draws. Players compete in a short game — the leaderboard decides.",
          },
        ].map(({ Icon, title, body }) => (
          <div key={title} className="card p-5">
            <Icon className="h-5 w-5 text-gold" strokeWidth={1.7} />
            <p className="mt-3 text-[0.9rem] font-medium tracking-tight">{title}</p>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 card gold-glow p-6">
        <div className="flex items-center gap-2">
          <Gem className="h-4 w-4 text-gold" strokeWidth={1.8} />
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-muted">Example</p>
        </div>
        <p className="mt-4 text-[1rem] leading-relaxed">
          Bought a Submariner for <span className="tabular text-gold">£8,450</span>? An instant
          cash offer lands around <span className="tabular text-gold">£8,500–£9,950</span>,
          deposited within 48 hours. List it on More4Me instead, and it can go up to{" "}
          <span className="tabular text-gold">£11,000</span> — you just have to wait for the
          competition to close.
        </p>
      </div>
    </div>
  );
}
