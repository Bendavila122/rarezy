import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** A big spread of recognisable brands — watch houses plus a few other prestige names — so the strip never feels like it's just looping the same handful. */
const LOGOS = [
  { name: "Rolex", src: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Rolex_wordmark_logo.svg" },
  { name: "Omega", src: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Omega_Logo.svg" },
  { name: "Cartier", src: "https://upload.wikimedia.org/wikipedia/commons/8/86/Cartier_logo.svg" },
  { name: "Patek Philippe", src: "https://upload.wikimedia.org/wikipedia/commons/0/02/Patek_Philippe_Logo.png" },
  { name: "Audemars Piguet", src: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Logo_Audemars_Piguet.svg" },
  { name: "TAG Heuer", src: "https://upload.wikimedia.org/wikipedia/commons/5/57/TAG_HEUER_logo.svg" },
  { name: "IWC", src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/International_Watch_Company_logo.svg" },
  { name: "Breitling", src: "https://upload.wikimedia.org/wikipedia/commons/0/06/Breitling_logo.png" },
  { name: "Tudor", src: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Tudor_%28Uhrenmarke%29_logo.svg" },
  { name: "Longines", src: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Longines_wordmark_logo.svg" },
  { name: "Vacheron Constantin", src: "https://upload.wikimedia.org/wikipedia/commons/1/16/Vacheron_Constantin.svg" },
  { name: "F.P. Journe", src: "https://upload.wikimedia.org/wikipedia/commons/5/52/F._P._Journe_Logo.svg" },
  { name: "Mercedes-Benz", src: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg" },
  { name: "Apple", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/apple.svg" },
  { name: "Samsung", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/samsung.svg" },
  { name: "BMW", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/bmw.svg" },
  { name: "Audi", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/audi.svg" },
  { name: "Hermès", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/hermes.svg" },
  { name: "Porsche", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/porsche.svg" },
  { name: "Ferrari", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/ferrari.svg" },
  { name: "Nike", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/nike.svg" },
  { name: "Rolls-Royce", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/rollsroyce.svg" },
  { name: "Bentley", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/bentley.svg" },
  { name: "Lamborghini", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/lamborghini.svg" },
  { name: "Dior", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/dior.svg" },
  { name: "Aston Martin", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/astonmartin.svg" },
  { name: "Tesla", src: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/tesla.svg" },
] as const;

let uid = 0;
const nextLogo = (i: number) => LOGOS[i % LOGOS.length]!;

/**
 * A little conveyor of brand logos feeding into the search bar — three
 * slots visible at a time, the leftmost (closest to the search bar, about
 * to be "eaten") blurring and fading out as it's replaced. Sits directly
 * against the search bar's right edge with a slight negative margin and a
 * lower z-index so the bar visually occludes it, selling the illusion.
 */
export function LogoEater() {
  const [queue, setQueue] = useState(() =>
    Array.from({ length: 3 }, (_, i) => ({ id: uid++, logo: nextLogo(i) })),
  );
  const cursor = useRef(3);

  useEffect(() => {
    const id = window.setInterval(() => {
      setQueue((q) => [...q.slice(1), { id: uid++, logo: nextLogo(cursor.current++) }]);
    }, 1300);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative z-0 -ml-4 hidden h-11 items-center gap-3 sm:flex">
      <AnimatePresence initial={false}>
        {queue.map((item, i) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.6, x: 16 }}
            animate={{
              opacity: i === 0 ? 0.3 : 1,
              scale: i === 0 ? 0.85 : 1,
              x: 0,
              filter: i === 0 ? "blur(2.5px)" : "blur(0px)",
            }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-[7px] shadow-md"
          >
            <img src={item.logo.src} alt={item.logo.name} className="h-full w-full object-contain" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
