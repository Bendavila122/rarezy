import { motion } from "motion/react";

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

const TRACK = [...LOGOS, ...LOGOS];

/**
 * A continuous conveyor of brand logos feeding into the search bar — a
 * three-slot window, never pausing between logos. A static blur + dark
 * gradient "gate" sits over the near slot (right against the search bar) so
 * whatever logo is passing through it doesn't just blur — it visually
 * dissolves into the same shadow as the page background, rather than
 * staying a bright white circle that merely loses focus. The strip sits
 * with a slight negative margin under the search bar's higher z-index, so
 * the bar physically occludes the near slot too.
 */
export function LogoEater() {
  return (
    <div className="relative z-0 -ml-4 hidden h-11 w-[132px] items-center overflow-hidden sm:flex">
      <motion.div
        className="flex items-center gap-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 34, ease: "linear", repeat: Infinity }}
      >
        {TRACK.map((logo, i) => (
          <div
            key={i}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-[7px] shadow-md"
          >
            <img src={logo.src} alt={logo.name} className="h-full w-full object-contain" />
          </div>
        ))}
      </motion.div>

      {/* Blur + dark gradient gate over the near slot, so whatever's passing through doesn't just go
          fuzzy — it visually dissolves into the same shadow as the page background behind it. */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16 backdrop-blur-[5px]"
        style={{ maskImage: "linear-gradient(to right, black 45%, transparent 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-16"
        style={{
          background: "linear-gradient(to right, oklch(0.15 0.008 260 / 92%) 30%, transparent 100%)",
        }}
      />
    </div>
  );
}
