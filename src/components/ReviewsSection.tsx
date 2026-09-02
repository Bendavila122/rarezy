import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Quote, Sparkles, Banknote } from "lucide-react";
import { Reveal } from "@/components/Reveal";

type Review = {
  id: string;
  type: "winner" | "seller";
  quote: string;
  user: string;
  city: string;
  initials: string;
  stat: string;
};

const REVIEWS: Review[] = [
  {
    id: "1",
    type: "winner",
    quote:
      "Entered on a whim during my lunch break, played one round, and somehow ended up with a Daytona. Still doesn't feel real.",
    user: "@ThomasFinds",
    city: "London",
    initials: "TF",
    stat: "Won a Rolex Daytona for £2",
  },
  {
    id: "2",
    type: "seller",
    quote:
      "I'd tried selling through a dealer twice and got lowballed both times. Rarezy valued it fairly and I walked away with more than I expected.",
    user: "@HorologyHannah",
    city: "Edinburgh",
    initials: "HH",
    stat: "Sold for £800 above valuation",
  },
  {
    id: "3",
    type: "winner",
    quote: "Played during my commute, forgot about it completely, then got the email a week later. My hands were shaking.",
    user: "@ClaraWinds",
    city: "Bristol",
    initials: "CW",
    stat: "Won an Omega Speedmaster for £4",
  },
  {
    id: "4",
    type: "seller",
    quote: "Authentication was done in two days, listing went live, and it sold within the week. The easiest sale I've had.",
    user: "@MarcusTicks",
    city: "Leeds",
    initials: "MT",
    stat: "Sold for £11,400",
  },
  {
    id: "5",
    type: "winner",
    quote: "I've bought raffle tickets for watches before and never won anything. This is the first time it actually felt fair.",
    user: "@priya.collects",
    city: "Manchester",
    initials: "PC",
    stat: "Won a Cartier Santos for £3",
  },
  {
    id: "6",
    type: "seller",
    quote: "No haggling in my inbox, no lowball DMs. Just a number, a quick authentication, and a payout.",
    user: "@ReeceRepeater",
    city: "Birmingham",
    initials: "RR",
    stat: "Sold for £6,150",
  },
];

const META: Record<Review["type"], { label: string; accent: string; Icon: typeof Sparkles }> = {
  winner: { label: "Winner", accent: "text-amber-300", Icon: Sparkles },
  seller: { label: "Seller", accent: "text-mint", Icon: Banknote },
};

function ReviewCard({ review }: { review: Review }) {
  const meta = META[review.type];
  return (
    <div className="glass-dark relative flex h-full flex-col overflow-hidden rounded-none p-6">
      <div className="flex items-center justify-between">
        <Quote className="h-7 w-7 text-white/25" strokeWidth={2} />
        <span className={`flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-wide ${meta.accent}`}>
          <meta.Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
          {meta.label}
        </span>
      </div>

      <p className="mt-4 text-[1.3rem] font-bold leading-tight tracking-[-0.01em] text-white">{review.stat}</p>

      <p className="mt-3 line-clamp-4 flex-1 text-[0.88rem] leading-relaxed text-white/70">"{review.quote}"</p>

      <div className="mt-4 flex items-center gap-2.5 border-t border-white/10 pt-4">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-bold ${
            review.type === "winner" ? "bg-amber-400/20 text-amber-300" : "bg-mint/20 text-mint"
          }`}
        >
          {review.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[0.78rem] font-medium text-white/85">{review.user}</p>
          <p className="text-[0.68rem] text-white/45">{review.city}</p>
        </div>
      </div>
    </div>
  );
}

/** Shortest circular distance from `i` to `current` out of `len` items — e.g. with 6 items, index 0 is 1 step *before* index 5, not 5 steps after. */
function circularDelta(i: number, current: number, len: number) {
  let d = i - current;
  d = ((d % len) + len) % len;
  if (d > len / 2) d -= len;
  return d;
}

/**
 * A stacked deck, not a flat swap: the current review sits sharp and full
 * size in the middle, with the previous one peeking in blurred just above
 * it and the next one peeking in blurred just below — both clickable to jump
 * straight there. Every card stays mounted the whole time (just animated to
 * an off-screen position when it's not one of the three in view), so the
 * whole stack glides continuously as the index changes instead of cutting.
 */
function ReviewCarousel() {
  const [index, setIndex] = useState(0);
  const len = REVIEWS.length;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % len), 4600);
    return () => clearInterval(id);
  }, [len]);

  // The current card only fills the *middle* of the square (not edge to
  // edge) — top-[16%] h-[68%] — leaving an empty 16%-tall strip above and
  // below it. That empty strip is exactly where a peek card's translateY(±100%)
  // resting position lands its own edge, so the sliver is genuinely visible
  // rather than hidden behind the full-size current card.
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[23rem] overflow-hidden">
      {REVIEWS.map((review, i) => {
        const delta = circularDelta(i, index, len);
        const inWindow = Math.abs(delta) <= 1;
        const y = delta === 0 ? "0%" : delta < 0 ? "-100%" : "100%";
        const pushedY = delta === 0 ? "0%" : delta < 0 ? "-230%" : "230%";
        return (
          <motion.div
            key={review.id}
            onClick={delta !== 0 ? () => setIndex(i) : undefined}
            animate={{
              y: inWindow ? y : pushedY,
              scale: delta === 0 ? 1 : 0.92,
              opacity: inWindow ? (delta === 0 ? 1 : 0.6) : 0,
              filter: delta === 0 ? "blur(0px)" : "blur(4px)",
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-x-0 top-[16%] h-[68%] ${delta === 0 ? "z-[3]" : "z-[2] cursor-pointer"} ${
              inWindow ? "" : "pointer-events-none"
            }`}
            style={{ willChange: "transform, filter, opacity" }}
          >
            <ReviewCard review={review} />
          </motion.div>
        );
      })}
    </div>
  );
}

const REACTIONS = [
  { src: "/videos/winner-reaction-1.mp4", poster: "/videos/winner-reaction-1-poster.png" },
  { src: "/videos/winner-reaction-2.mp4", poster: "/videos/winner-reaction-2-poster.png" },
  { src: "/videos/winner-reaction-3.mp4", poster: "/videos/winner-reaction-3-poster.png" },
];

/** A looping reel of winners opening their box and reacting — crossfades between clips, one after another, forever. */
function ReactionReel() {
  const [index, setIndex] = useState(0);

  return (
    <div className="relative h-[26rem] overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <video
            src={REACTIONS[index]!.src}
            poster={REACTIONS[index]!.poster}
            autoPlay
            muted
            playsInline
            onEnded={() => setIndex((i) => (i + 1) % REACTIONS.length)}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          <p className="absolute bottom-5 left-5 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-mint">
            Opening the box
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Split in half: a clickable stacked-deck carousel of quotes on the left, a looping reel of winners opening their box on the right. */
export function ReviewsSection() {
  return (
    <div className="relative z-10 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">Reviews</p>
          <h2 className="mt-2 text-[1.5rem] font-semibold leading-tight tracking-[-0.02em]">
            What buyers and sellers are saying.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-8 grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
          <ReviewCarousel />
          <ReactionReel />
        </Reveal>
      </div>
    </div>
  );
}
