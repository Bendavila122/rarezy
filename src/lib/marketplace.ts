/**
 * More4Me's core logic: sell an item for an instant cash offer, or enter it
 * into a skill-based competition that can pay out more — for people willing
 * to wait, and willing to play for it. No random draws: the winner is
 * whoever tops the leaderboard when the competition closes.
 *
 * Pure — no state, no side effects. The reactive store lives in ./store.
 */

export type ItemCategory = "watches" | "handbags" | "jewellery" | "sneakers";

export const CATEGORIES: { id: ItemCategory; label: string; glyph: string }[] = [
  { id: "watches", label: "Watches", glyph: "⌚" },
  { id: "handbags", label: "Handbags", glyph: "👜" },
  { id: "jewellery", label: "Jewellery", glyph: "💍" },
  { id: "sneakers", label: "Sneakers", glyph: "👟" },
];

export const BRANDS: Record<ItemCategory, string[]> = {
  watches: [
    "Rolex",
    "Patek Philippe",
    "Audemars Piguet",
    "Richard Mille",
    "Vacheron Constantin",
    "Omega",
    "Cartier",
    "Tudor",
    "Tag Heuer",
  ],
  handbags: ["Hermès", "Chanel", "Louis Vuitton", "Dior", "Gucci", "Bottega Veneta"],
  jewellery: ["Cartier", "Van Cleef & Arpels", "Tiffany & Co.", "Bulgari", "Chopard"],
  sneakers: ["Nike", "Jordan", "Adidas", "New Balance"],
};

export type Condition = "new" | "excellent" | "good" | "fair";

export const CONDITIONS: { id: Condition; label: string; hint: string; multiplier: number }[] = [
  { id: "new", label: "Unworn", hint: "Full set, never worn", multiplier: 1.02 },
  { id: "excellent", label: "Excellent", hint: "Light wear, fully serviced", multiplier: 1.0 },
  { id: "good", label: "Good", hint: "Visible wear, works perfectly", multiplier: 0.94 },
  { id: "fair", label: "Fair", hint: "Heavy wear or needs servicing", multiplier: 0.85 },
];

/** Prestige relative to a Rolex baseline of 1.0 — the dial "market data" turns. */
const PRESTIGE: Record<string, number> = {
  "Richard Mille": 1.22,
  "Patek Philippe": 1.18,
  "Audemars Piguet": 1.15,
  "Vacheron Constantin": 1.12,
  Rolex: 1.0,
  "Van Cleef & Arpels": 1.14,
  "Hermès": 1.13,
  Cartier: 1.05,
  Chanel: 1.02,
  Bulgari: 1.02,
  "Tiffany & Co.": 0.98,
  Chopard: 0.99,
  "Louis Vuitton": 0.95,
  "Bottega Veneta": 0.94,
  Dior: 0.97,
  Gucci: 0.92,
  Tudor: 0.85,
  Omega: 0.88,
  "Tag Heuer": 0.78,
  Jordan: 0.9,
  Nike: 0.85,
  Adidas: 0.8,
  "New Balance": 0.82,
};

const prestigeOf = (brand: string) => PRESTIGE[brand] ?? 0.9;
const conditionMultiplier = (condition: Condition) =>
  CONDITIONS.find((c) => c.id === condition)?.multiplier ?? 1;

export const roundTo = (n: number, step = 50) => Math.round(n / step) * step;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Below this, an item can still take a cash offer, but can't go to competition. */
export const MIN_COMPETITION_VALUE = 2000;

export type LuxuryItem = {
  category: ItemCategory;
  brand: string;
  model: string;
  reference?: string | undefined;
  year: number;
  condition: Condition;
  purchasePrice: number;
};

export type Valuation = {
  /** What More4Me will pay, cash, within 48 hours. */
  cashLow: number;
  cashHigh: number;
  /** The most the competition could realistically raise — hits this and it closes early. */
  ceiling: number;
  /** The floor a seller is allowed to set as their walk-away price. */
  suggestedMinimum: number;
};

/**
 * The "AI-generated" offer range: market data (prestige), condition and the
 * price paid, blended into a cash range and a competition ceiling.
 */
export function estimateValue(item: Pick<LuxuryItem, "brand" | "purchasePrice" | "condition">): Valuation {
  const base = item.purchasePrice * prestigeOf(item.brand) * conditionMultiplier(item.condition);
  return {
    cashLow: roundTo(base * 1.006),
    cashHigh: roundTo(base * 1.18),
    ceiling: roundTo(base * 1.3),
    suggestedMinimum: roundTo(base * 1.18),
  };
}

export const DEADLINE_OPTIONS = [7, 14, 30, 45, 60] as const;

/**
 * What an entry actually costs a player, and what's left once VAT is pulled
 * out of the 50% processing fee. A £2 entry becomes a £3 charge: £2.50 net
 * of VAT, £2.00 of that owed to the seller's pot, 50p kept.
 */
export function entryPricing(entryFee: number) {
  const charge = round2(entryFee * 1.5);
  const netOfVat = round2(charge / 1.2);
  const vat = round2(charge - netOfVat);
  const profit = round2(netOfVat - entryFee);
  return { entryFee, charge, vat, netOfVat, profit, sellerProceeds: entryFee };
}

export function suggestEntryCount(ceiling: number, entryFee: number) {
  return Math.max(1, Math.ceil(ceiling / Math.max(0.5, entryFee)));
}

const FICTITIOUS_PLAYERS = [
  "A. Whitfield",
  "M. Okonkwo",
  "S. Iyer",
  "J. Laurent",
  "C. Meng",
  "R. Fontaine",
  "D. Osei",
  "P. Nakamura",
  "K. Ferreira",
  "L. Bergström",
];

export function randomPlayerName() {
  return FICTITIOUS_PLAYERS[Math.floor(Math.random() * FICTITIOUS_PLAYERS.length)]!;
}

export const titleOf = (item: LuxuryItem) =>
  `${item.brand} ${item.model}${item.reference ? ` (${item.reference})` : ""}`;

export const glyphOf = (category: ItemCategory) =>
  CATEGORIES.find((c) => c.id === category)?.glyph ?? "✨";

export const money = (n: number) =>
  n.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
