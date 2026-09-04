/**
 * Rarezy's core logic: sell an item for an instant cash offer, or list it
 * with an entry price that can pay out more — for people willing to wait,
 * and willing to play for it. No random draws: the winner is whoever tops
 * the leaderboard when the listing's deadline hits.
 *
 * Watches were the whole marketplace at launch; Browse now shows every
 * category. `car` stays in `ITEM_CATEGORIES` and the filter drawer even
 * though no seed listing currently uses it — cars were pulled "for now"
 * and the category is meant to be repopulated later, not deleted.
 *
 * Pure — no state, no side effects. The reactive store lives in ./store.
 */

export const WATCH_BRANDS = [
  "Rolex",
  "Patek Philippe",
  "Audemars Piguet",
  "Vacheron Constantin",
  "Omega",
  "Cartier",
  "Tudor",
  "Tag Heuer",
  "Breitling",
  "IWC Schaffhausen",
  "Jaeger-LeCoultre",
  "Grand Seiko",
] as const;

export type Condition = "new" | "excellent" | "good" | "fair";

export const CONDITIONS: { id: Condition; label: string; hint: string; multiplier: number }[] = [
  { id: "new", label: "Unworn", hint: "Full set, never worn", multiplier: 1.02 },
  { id: "excellent", label: "Excellent", hint: "Light wear, fully serviced", multiplier: 1.0 },
  { id: "good", label: "Good", hint: "Visible wear, works perfectly", multiplier: 0.94 },
  { id: "fair", label: "Fair", hint: "Heavy wear or needs servicing", multiplier: 0.85 },
];

/** Prestige relative to a Rolex baseline of 1.0 — the dial "market data" turns. */
const PRESTIGE: Record<string, number> = {
  "Patek Philippe": 1.18,
  "Audemars Piguet": 1.15,
  "Vacheron Constantin": 1.12,
  Rolex: 1.0,
  Cartier: 1.05,
  Tudor: 0.85,
  Omega: 0.88,
  "Tag Heuer": 0.78,
  Breitling: 0.84,
  "IWC Schaffhausen": 0.9,
  "Jaeger-LeCoultre": 0.93,
  "Grand Seiko": 0.75,
};

const prestigeOf = (brand: string) => PRESTIGE[brand] ?? 0.9;
const conditionMultiplier = (condition: Condition) =>
  CONDITIONS.find((c) => c.id === condition)?.multiplier ?? 1;

export const roundTo = (n: number, step = 50) => Math.round(n / step) * step;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Below this, a watch can still take a cash offer, but can't be listed for entries. */
export const MIN_COMPETITION_VALUE = 2000;

export const ITEM_CATEGORIES = ["watch", "car", "handbag", "cash", "clothing", "electronics", "jewellery"] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export type LuxuryItem = {
  /** Absent on every pre-existing watch — treat as "watch" (see `categoryOf`) rather than backfilling every seed entry. */
  category?: ItemCategory | undefined;
  brand: string;
  model: string;
  reference?: string | undefined;
  year: number;
  condition: Condition;
  purchasePrice: number;
  /** Full write-up shown on the listing — condition, history, what's included. */
  description?: string | undefined;
  /** Professional photos: dial, case back, box and papers. */
  photos?: string[] | undefined;
  /** Specification table shown on the listing page — Chrono24-style "Basic Info". Watch-specific; other categories just leave these unset. */
  movement?: string | undefined;
  caseMaterial?: string | undefined;
  braceletMaterial?: string | undefined;
  dialColor?: string | undefined;
  bezelMaterial?: string | undefined;
  crystal?: string | undefined;
  caseDiameterMm?: number | undefined;
  lugWidthMm?: number | undefined;
  /** What's included — e.g. "Original box, original papers". */
  accessories?: string | undefined;
  /** Where the seller says they originally bought it — collected at submission, checked as part of the authenticity review. */
  purchasedFrom?: string | undefined;

  /** Shared across cars/handbags/clothing/electronics — absent on watches, which use `dialColor` instead. */
  color?: string | undefined;
  /** Handbags and clothing. */
  material?: string | undefined;
  size?: string | undefined;
  /** Handbags only — e.g. "Gold-tone". */
  hardware?: string | undefined;
  /** Jewellery only — e.g. "0.5ct round brilliant diamond". */
  gemstone?: string | undefined;
  /** Cars only. */
  mileage?: number | undefined;
  fuelType?: string | undefined;
  transmission?: string | undefined;
  bodyType?: string | undefined;
  drivetrain?: string | undefined;
  enginePowerBhp?: number | undefined;
  doors?: number | undefined;
  /** Electronics only. */
  storageCapacity?: string | undefined;
  screenSize?: string | undefined;
  connectivity?: string | undefined;
};

export const categoryOf = (item: Pick<LuxuryItem, "category">): ItemCategory => item.category ?? "watch";

/** One line of the in-person inspection checklist on a certificate — e.g. "Movement & timekeeping". */
export type AnalysisFinding = {
  label: string;
  note: string;
  flagged: boolean;
};

/**
 * The certificate of authenticity generated once a consigned item has been
 * physically inspected — attached to its listing so buyers can see exactly
 * what was checked before it went into the vault.
 */
export type AnalysisReport = {
  certificateId: string;
  generatedAt: string;
  inspectorName: string;
  summary: string;
  findings: AnalysisFinding[];
};

export type Valuation = {
  /** What Rarezy will pay, cash, within 48 hours. */
  cashLow: number;
  cashHigh: number;
  /** The most the listing could realistically raise — hits this and it closes early. */
  ceiling: number;
  /** The floor a seller is allowed to set as their walk-away price. */
  suggestedMinimum: number;
};

/**
 * The "AI-generated" offer range: market data (prestige), condition and the
 * price paid, blended into a cash range and a listing ceiling.
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

/** Every player picks a username at signup — leaderboards and the winners wall show that, never a real name. */
const FICTITIOUS_PLAYERS = [
  "steelandgold",
  "vintagevalor",
  "northbezel",
  "dial.dane",
  "rolexrick",
  "tickfaster",
  "brightoncrown",
  "vaultwatches",
  "midnightmvmt",
  "caseandcrown",
  "olivertick",
  "kaelscollection",
];

export function randomPlayerName() {
  return FICTITIOUS_PLAYERS[Math.floor(Math.random() * FICTITIOUS_PLAYERS.length)]!;
}

/** In-house Rarezy specialists who conduct collection visits and inspections — distinct from the fictitious players above. */
const FICTITIOUS_REPS = [
  "James Whitfield",
  "Priya Anand",
  "Tom Beaumont",
  "Sofia Marchetti",
  "Daniel Osei",
];

export function randomRepName() {
  return FICTITIOUS_REPS[Math.floor(Math.random() * FICTITIOUS_REPS.length)]!;
}

export const titleOf = (item: LuxuryItem) =>
  `${item.brand} ${item.model}${item.reference ? ` (${item.reference})` : ""}`;

export const MOVEMENT_TYPES = ["Automatic", "Manual-wind", "Spring Drive", "Quartz"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number] | "Other";

/** Buckets a free-text movement spec (e.g. "Automatic (Cal. 3135)") into a filterable category. */
export function movementType(movement?: string): MovementType {
  const m = (movement ?? "").toLowerCase();
  if (m.includes("spring drive")) return "Spring Drive";
  if (m.includes("manual")) return "Manual-wind";
  if (m.includes("automatic")) return "Automatic";
  if (m.includes("quartz")) return "Quartz";
  return "Other";
}

/** True when the accessories text names both the original box and papers — Chrono24's "full set". */
export const isFullSet = (accessories?: string) => {
  const a = (accessories ?? "").toLowerCase();
  return a.includes("box") && a.includes("papers");
};

export const isWithinHours = (iso: string, hours: number) => {
  const diff = new Date(iso).getTime() - Date.now();
  return diff >= 0 && diff <= hours * 3_600_000;
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });

/** Same calendar day as right now, in the viewer's local time. */
export const isToday = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

export const money = (n: number) =>
  n.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** "£1.2M" style formatting for headline stat tiles where the full pence figure would be too wide. */
export const moneyCompact = (n: number) =>
  n.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  });
