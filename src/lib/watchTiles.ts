/**
 * Every merge-tile value is skinned as a real watch brand, ranked roughly by
 * market prestige as the numbers climb — entry-level marques on the small
 * early tiles, the icons of the industry on the tiles a player rarely
 * reaches. Logos are sourced from Wikimedia Commons, each on its own white
 * card in its natural colours (see the design-language memory for why —
 * some source files break under a colour-invert filter). Rarezy doesn't
 * carry Richard Mille, so the tier beyond the win value is Vacheron Constantin
 * instead.
 */
export type TileTheme = {
  value: number;
  brand: string;
  logo?: string;
  bg: string;
  badge: string;
};

const LOGOS = {
  longines: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Longines_wordmark_logo.svg",
  tagHeuer: "https://upload.wikimedia.org/wikipedia/commons/5/57/TAG_HEUER_logo.svg",
  tudor: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Tudor_%28Uhrenmarke%29_logo.svg",
  omega: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Omega_Logo.svg",
  breitling: "https://upload.wikimedia.org/wikipedia/commons/0/06/Breitling_logo.png",
  cartier: "https://upload.wikimedia.org/wikipedia/commons/8/86/Cartier_logo.svg",
  iwc: "https://upload.wikimedia.org/wikipedia/commons/f/fa/International_Watch_Company_logo.svg",
  patek: "https://upload.wikimedia.org/wikipedia/commons/0/02/Patek_Philippe_Logo.png",
  rolex: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Rolex_wordmark_logo.svg",
  audemarsPiguet: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Logo_Audemars_Piguet.svg",
  vacheron: "https://upload.wikimedia.org/wikipedia/commons/1/16/Vacheron_Constantin.svg",
  fpJourne: "https://upload.wikimedia.org/wikipedia/commons/5/52/F._P._Journe_Logo.svg",
} as const;

const THEMES: Record<number, Omit<TileTheme, "value">> = {
  2: { brand: "Longines", logo: LOGOS.longines, bg: "#f3ead9", badge: "#2b2015" },
  4: { brand: "TAG Heuer", logo: LOGOS.tagHeuer, bg: "#e9d3ad", badge: "#2b2015" },
  8: { brand: "Tudor", logo: LOGOS.tudor, bg: "#d9b878", badge: "#2b2015" },
  16: { brand: "Omega", logo: LOGOS.omega, bg: "#c99a4c", badge: "#241a0c" },
  32: { brand: "Breitling", logo: LOGOS.breitling, bg: "#a97a3f", badge: "#fdf6ea" },
  64: { brand: "Cartier", logo: LOGOS.cartier, bg: "#8a6034", badge: "#fdf6ea" },
  128: { brand: "IWC Schaffhausen", logo: LOGOS.iwc, bg: "#5b4128", badge: "#f3e6c8" },
  256: { brand: "F.P. Journe", logo: LOGOS.fpJourne, bg: "#3c2c1c", badge: "#f3e6c8" },
  512: { brand: "Rolex", logo: LOGOS.rolex, bg: "#2a2118", badge: "#e8c988" },
  1024: { brand: "Audemars Piguet", logo: LOGOS.audemarsPiguet, bg: "#132420", badge: "#e8c988" },
  2048: { brand: "Patek Philippe", logo: LOGOS.patek, bg: "#0a0a0a", badge: "#f1cd6b" },
  4096: { brand: "Vacheron Constantin", logo: LOGOS.vacheron, bg: "#0a0a0a", badge: "#f1cd6b" },
};

const FALLBACK: Omit<TileTheme, "value"> = { brand: "One of one", bg: "#0a0a0a", badge: "#f1cd6b" };

export function themeFor(value: number): TileTheme {
  return { value, ...(THEMES[value] ?? FALLBACK) };
}
