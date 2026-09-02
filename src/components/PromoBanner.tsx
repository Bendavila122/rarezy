import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const COLORS = [
  { text: "text-red-400", dot: "bg-red-400" },
  { text: "text-mint", dot: "bg-mint" },
  { text: "text-amber-300", dot: "bg-amber-300" },
] as const;

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
      {ITEMS.map((item, i) => {
        const c = COLORS[i % COLORS.length];
        return (
          <span key={i} className={`mx-5 flex shrink-0 items-center gap-2 font-bold ${c.text}`}>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
            {item}
          </span>
        );
      })}
      <span className="mx-5 flex shrink-0 items-center gap-1.5 font-bold text-mint">
        Browse now
        <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
      </span>
    </>
  );
}

/** Continuously sliding ticker under the header — flash-info lines in rotating colours (mint/amber/red) for eye-catching contrast, sitting on a pure blur (no solid fill) so the mesh background shows through. */
export function PromoBanner() {
  return (
    <div className="relative z-10 w-full overflow-hidden border-y border-white/10 bg-black/10 backdrop-blur-xl">
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
