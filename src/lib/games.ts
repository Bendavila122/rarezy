/**
 * Rarezy's game catalog — the platform runs several interchangeable skill
 * games, each its own self-contained module (own engine, own preview, own
 * play component, registered in `@/components/GameRegistry`). Every
 * competition is tied to exactly one game at the moment it's listed, and
 * that choice is permanent for the rest of that competition's life — see
 * `CompetitionListing.gameId` in `./store`. This file only holds the pure
 * catalog data; the actual components live in GameRegistry since this file
 * has to stay JSX-free like the rest of `lib`.
 */
export type GameId = "merge" | "reflex" | "precision" | "memory" | "hunt";

export type GameDef = {
  id: GameId;
  name: string;
  tagline: string;
  description: string;
  glow: string;
  glow2: string;
};

export const GAMES: readonly GameDef[] = [
  {
    id: "merge",
    name: "Rarezy Merge",
    tagline: "Slide, merge, climb the ladder",
    description:
      "Swipe to merge matching watch brands up the ladder. No luck of the draw — the highest score on the board wins.",
    glow: "oklch(0.82 0.19 148)",
    glow2: "oklch(0.75 0.19 80)",
  },
  {
    id: "reflex",
    name: "Rarezy Reflex",
    tagline: "Pure reflexes, not strategy",
    description:
      "A named brand lights up somewhere on the board — tap it before the timer runs out. Wrong tile or a red decoy ends the run.",
    glow: "oklch(0.75 0.19 80)",
    glow2: "oklch(0.82 0.19 148)",
  },
  {
    id: "precision",
    name: "Rarezy Precision",
    tagline: "Stop the watch",
    description:
      "A hand sweeps continuously around the dial — stop it inside the target zone. The zone shrinks and the hand speeds up every round.",
    glow: "oklch(0.82 0.19 148)",
    glow2: "oklch(0.75 0.19 80)",
  },
  {
    id: "memory",
    name: "Rarezy Memory",
    tagline: "Remember the collection",
    description:
      "A sequence of brands lights up on the board, then disappears — repeat it back in order. One wrong tap ends the run, and each round adds one more step.",
    glow: "oklch(0.75 0.19 80)",
    glow2: "oklch(0.82 0.19 148)",
  },
  {
    id: "hunt",
    name: "Rarezy Hunt",
    tagline: "Find the odd one out",
    description:
      "Nearly every tile on the board is the same brand — exactly one is different. Find it before the timer runs out; the board grows every couple of rounds.",
    glow: "oklch(0.82 0.19 148)",
    glow2: "oklch(0.75 0.19 80)",
  },
] as const;

export const DEFAULT_GAME_ID: GameId = GAMES[0]!.id;

export function gameById(id: GameId | string | undefined): GameDef {
  return GAMES.find((g) => g.id === id) ?? GAMES[0]!;
}

export function randomGameId(): GameId {
  return GAMES[Math.floor(Math.random() * GAMES.length)]!.id;
}
