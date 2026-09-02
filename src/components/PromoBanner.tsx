import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const ITEMS = [
  "Win a luxury watch for £2",
  "Every item independently authenticated",
  "New competitions close daily",
  "Sellers earn more than a private sale",
  "Not just watches — jewellery, bags & more",
  "Instant cash offers available",
];

function TickerRow() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="mx-5 flex shrink-0 items-center gap-2 font-bold text-white">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
          {item}
        </span>
      ))}
      <span className="mx-5 flex shrink-0 items-center gap-1.5 font-bold text-white">
        Browse now
        <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
      </span>
    </>
  );
}

/** Continuously sliding ticker under the header — white lettering on a dark red blurred backdrop for maximum eye-catching contrast against the rest of the mint/dark palette. */
export function PromoBanner() {
  return (
    <div className="relative z-10 w-full overflow-hidden border-y border-red-800/40 bg-red-950/50 backdrop-blur-xl">
      <Link to="/browse" className="block py-2.5">
        <motion.div
          className="flex whitespace-nowrap text-[0.8rem] tracking-tight"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        >
          <TickerRow />
          <TickerRow />
        </motion.div>
      </Link>
    </div>
  );
}
