import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** A big spread of recognisable brands — watch houses plus a few other prestige names — so the badge never feels like it's just looping the same handful. */
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

/** One brand badge at a time, crossfading, tucked inside the search bar's right edge. */
export function SearchLogoBadge() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % LOGOS.length), 1800);
    return () => window.clearInterval(id);
  }, []);

  const logo = LOGOS[index]!;

  return (
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
      <AnimatePresence mode="wait">
        <motion.div
          key={logo.name}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white p-[5px] shadow-md"
        >
          <img src={logo.src} alt={logo.name} className="h-full w-full object-contain" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
