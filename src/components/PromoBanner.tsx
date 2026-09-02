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
        <span key={i} className="mx-5 flex shrink-0 items-center gap-2">
          <span className="h-1 w-1 shrink-0 rounded-full bg-mint" />
          {item}
        </span>
      ))}
      <span className="mx-5 flex shrink-0 items-center gap-1.5 text-mint">
        Browse now
        <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
      </span>
    </>
  );
}

/** Continuously sliding ticker under the header — a bunch of short flash-info lines looping left, glass-dark background so it reads as part of the page. */
export function PromoBanner() {
  return (
    <div className="glass-dark relative z-10 w-full overflow-hidden">
      <Link to="/browse" className="block py-2.5">
        <motion.div
          className="flex whitespace-nowrap text-[0.8rem] font-semibold tracking-tight text-white/85"
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
