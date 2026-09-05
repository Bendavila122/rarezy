import { BrowseScreen, PlayScreen, WinScreen } from "@/components/WalkthroughScreens";

/** "Instagram lyric" text styles — short fragments at wildly different sizes/weights/fonts so the copy reads like it's being spoken aloud rather than sitting as one flat paragraph. Content for the homepage's two-stop scroll story (buyers, marketplace) — this page is buyer-facing only, the seller pitch lives on its own "Rarezy for Businesses" page instead. Kept in its own module so ScrollStory.tsx stays focused on layout/scroll mechanics. */
export const BASE = "text-[1.05rem] sm:text-[1.15rem] font-medium text-white/60";
export const MID = "text-[1.35rem] sm:text-[1.55rem] font-bold text-white";
export const HUGE =
  "text-[2.6rem] sm:text-[3.6rem] font-black italic leading-[0.95] text-mint [font-family:var(--font-display)]";
export const AMBER = "text-[2rem] sm:text-[2.6rem] font-extrabold leading-[1.05] text-amber-300";

export type Line = { text: string; cls: string };

export type Stop = {
  eyebrow: string;
  /** A couple of phone screens this stop cycles through on its own while it's the active stop — the scroll gate only advances between stops, not between a stop's own screens. */
  Screens: Array<() => React.JSX.Element>;
  glow: string;
  glow2: string;
  lines: Line[];
};

export const STOPS: Stop[] = [
  {
    eyebrow: "For buyers",
    Screens: [PlayScreen, WinScreen],
    glow: "oklch(0.82 0.19 148)",
    glow2: "oklch(0.82 0.16 80)",
    lines: [
      { text: "We give you the chance to", cls: BASE },
      { text: "WIN", cls: HUGE },
      { text: "a luxury item worth between", cls: BASE },
      { text: "£500 to £100,000", cls: AMBER },
      { text: "for as little as", cls: BASE },
      { text: "20p", cls: HUGE },
      { text: "Play a quick skill game.", cls: MID },
      { text: "See your rank", cls: MID },
      { text: "INSTANTLY.", cls: AMBER },
      { text: "Hundreds of luxury items to choose from.", cls: BASE },
    ],
  },
  {
    eyebrow: "The marketplace",
    Screens: [BrowseScreen, WinScreen],
    glow: "oklch(0.82 0.19 148)",
    glow2: "oklch(0.75 0.19 80)",
    lines: [
      { text: "One marketplace.", cls: MID },
      { text: "Every item,", cls: BASE },
      { text: "independently authenticated.", cls: MID },
      { text: "Watches. Jewellery. Bags. Sneakers.", cls: MID },
      { text: "New competitions", cls: BASE },
      { text: "EVERY DAY.", cls: HUGE },
      { text: "Better odds, better prices,", cls: BASE },
      { text: "for EVERYONE.", cls: AMBER },
    ],
  },
];
