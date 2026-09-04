import { useSyncExternalStore } from "react";
import {
  estimateValue,
  randomPlayerName,
  randomRepName,
  suggestEntryCount,
  type AnalysisReport,
  type LuxuryItem,
  type Valuation,
} from "./marketplace";

export type CashDeal = {
  id: string;
  kind: "cash";
  item: LuxuryItem;
  offer: Valuation;
  acceptedAmount: number;
  acceptedAt: string;
};

export type CompetitionStatus =
  | "authenticating"
  | "live"
  | "closed"
  | "awaiting_decision"
  | "partner_settled"
  | "returned";

export type HistoryEntry = { at: string; label: string };
export type LeaderboardEntry = { name: string; score: number; isYou?: boolean };

export type CompetitionListing = {
  id: string;
  kind: "competition";
  item: LuxuryItem;
  offer: Valuation;
  entryFee: number;
  entriesTotal: number;
  entriesSold: number;
  minimumPrice: number;
  /** entryFee * entriesTotal — reach it and the listing closes early. */
  targetMax: number;
  deadlineDays: number;
  deadlineAt: string;
  createdAt: string;
  status: CompetitionStatus;
  certificateId?: string | undefined;
  /** The full in-person inspection writeup — set once an admin publishes it, which is also what flips a consigned item from "authenticating" to "live". */
  analysisReport?: AnalysisReport | undefined;
  /** Tickets bought by the signed-in player, not the fictitious field. */
  myEntries: number;
  /** Attempts at the skill game still owed for those tickets. */
  attemptsRemaining: number;
  myBestScore?: number | undefined;
  /** Top of the leaderboard — not every entrant, just who's in contention. */
  leaderboard: LeaderboardEntry[];
  winnerName?: string | undefined;
  /** Seeded stock Rarezy already owns — bought back and re-listed for the house. */
  isHouseStock?: boolean | undefined;
  history: HistoryEntry[];
};

export type SubmissionStatus =
  | "pending_review"
  | "rejected"
  | "offer_ready"
  | "visit_scheduled"
  | "declined_by_seller"
  | "visit_completed_cash"
  | "visit_completed_consignment"
  | "declined_at_visit";

/**
 * A sell request working its way through admin review, before it becomes a
 * real `CashDeal` or `CompetitionListing`. Nothing is paid out or listed
 * until a rep has physically inspected the item at the collection visit.
 */
export type Submission = {
  id: string;
  kind: "submission";
  item: LuxuryItem;
  submittedAt: string;
  status: SubmissionStatus;
  /** Set by the admin on approval or rejection. */
  adminNotes?: string | undefined;
  /** The admin's rough cash range + ticket ceiling, shown to the seller once approved. */
  offer?: Valuation | undefined;
  /** Which of the two offers the seller chose to proceed with, before the visit confirms it. */
  sellerChoice?: "cash" | "consignment" | undefined;
  proposedEntryFee?: number | undefined;
  proposedMinimumPrice?: number | undefined;
  proposedDeadlineDays?: number | undefined;
  visit?: { scheduledAt: string; repName: string } | undefined;
  /** The `CashDeal` or `CompetitionListing` this became, once the visit resolves it. */
  resultRecordId?: string | undefined;
  history: HistoryEntry[];
};

export type SellRecord = CashDeal | CompetitionListing | Submission;
export type BasketEntry = { listingId: string; qty: number };
export type AccountUser = { username: string; isAdmin?: boolean | undefined };

type State = {
  records: SellRecord[];
  watchlist: string[];
  basket: BasketEntry[];
  /** Guests can browse everything; this is null until they create a free account. */
  currentUser: AccountUser | null;
};

const id = () => Math.random().toString(36).slice(2, 9);
const certId = () => `M4M-CERT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const now = () => new Date().toISOString();
const raisedOf = (c: CompetitionListing) => c.entriesSold * c.entryFee;
const topOf = (board: LeaderboardEntry[]) => board[0]?.name ?? randomPlayerName();

function seedListing(
  item: LuxuryItem,
  config: {
    entryFee: number;
    entriesTotal: number;
    minimumPrice: number;
    deadlineDays: number;
    entriesSold: number;
    daysElapsed: number;
    leaderboard: LeaderboardEntry[];
    isHouseStock?: boolean;
  },
): CompetitionListing {
  const offer = estimateValue(item);
  const createdAt = new Date(Date.now() - config.daysElapsed * 86_400_000).toISOString();
  const deadlineAt = new Date(
    Date.now() + (config.deadlineDays - config.daysElapsed) * 86_400_000,
  ).toISOString();
  return {
    id: id(),
    kind: "competition",
    item,
    offer,
    entryFee: config.entryFee,
    entriesTotal: config.entriesTotal,
    entriesSold: config.entriesSold,
    minimumPrice: config.minimumPrice,
    targetMax: config.entryFee * config.entriesTotal,
    deadlineDays: config.deadlineDays,
    deadlineAt,
    createdAt,
    status: "live",
    certificateId: certId(),
    myEntries: 0,
    attemptsRemaining: 0,
    leaderboard: config.leaderboard,
    isHouseStock: config.isHouseStock,
    history: [{ at: createdAt, label: "Authenticated by our partner watch specialist and listed" }],
  };
}

/** Picks a ticket price in line with what the Sell flow itself suggests for a watch of this value. */
function tierEntryFee(purchasePrice: number) {
  if (purchasePrice > 200_000) return 50;
  if (purchasePrice > 80_000) return 25;
  if (purchasePrice > 30_000) return 10;
  if (purchasePrice > 10_000) return 5;
  return 2;
}

/** Every player picks a username at signup — leaderboards and the winners wall show that, never a real name. */
const SEED_PLAYERS = [
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
  "iyer.spins",
  "fontaine84",
];
let boardOffset = 0;
/** A leaderboard for seed data — `count` descending scores from `top`, against a rotating cast. */
function board(count: number, top: number): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  let score = top;
  for (let i = 0; i < count; i++) {
    entries.push({ name: SEED_PLAYERS[(boardOffset + i) % SEED_PLAYERS.length]!, score });
    score = Math.max(500, score - (3 + ((i * 7) % 11)));
  }
  boardOffset += 5;
  return entries;
}

/** Wires up a house-stock listing from a watch and a few tuning knobs, deriving ticket price and minimum the same way the Sell flow would. */
function autoListing(
  item: LuxuryItem,
  opts: { deadlineDays: number; daysElapsed: number; soldRatio: number; leaderboard: LeaderboardEntry[] },
): CompetitionListing {
  const offer = estimateValue(item);
  const entryFee = tierEntryFee(item.purchasePrice);
  const entriesTotal = suggestEntryCount(offer.ceiling, entryFee);
  return seedListing(item, {
    entryFee,
    entriesTotal,
    minimumPrice: offer.suggestedMinimum,
    deadlineDays: opts.deadlineDays,
    entriesSold: Math.round(entriesTotal * opts.soldRatio),
    daysElapsed: opts.daysElapsed,
    leaderboard: opts.leaderboard,
    isHouseStock: true,
  });
}

/** Overrides a seed listing's deadline to land a set number of hours from now — for demoing "ending today". */
function endingInHours(listing: CompetitionListing, hours: number): CompetitionListing {
  return { ...listing, deadlineAt: new Date(Date.now() + hours * 3_600_000).toISOString() };
}

/** A past competition, already sold out and won — seed content for the homepage's winners wall. */
function closedListing(
  item: LuxuryItem,
  opts: { daysAgo: number; leaderboard: LeaderboardEntry[] },
): CompetitionListing {
  const offer = estimateValue(item);
  const entryFee = tierEntryFee(item.purchasePrice);
  const entriesTotal = suggestEntryCount(offer.ceiling, entryFee);
  const winnerName = topOf(opts.leaderboard);
  const deadlineAt = new Date(Date.now() - opts.daysAgo * 86_400_000).toISOString();
  const createdAt = new Date(Date.now() - (opts.daysAgo + 24) * 86_400_000).toISOString();
  const raised = entriesTotal * entryFee;
  return {
    id: id(),
    kind: "competition",
    item,
    offer,
    entryFee,
    entriesTotal,
    entriesSold: entriesTotal,
    minimumPrice: offer.suggestedMinimum,
    targetMax: raised,
    deadlineDays: opts.daysAgo + 24,
    deadlineAt,
    createdAt,
    status: "closed",
    certificateId: certId(),
    myEntries: 0,
    attemptsRemaining: 0,
    leaderboard: opts.leaderboard,
    winnerName,
    isHouseStock: true,
    history: [
      { at: createdAt, label: "Authenticated by our partner watch specialist and listed" },
      { at: deadlineAt, label: `Deadline reached — won by ${winnerName} at ${raised.toLocaleString("en-GB")}` },
    ],
  };
}

/**
 * Twenty pieces Rarezy already holds in the safe deposit — bought back at an
 * instant cash offer, then relisted with a ticket price. Photography is
 * professional-style studio product shots on white backgrounds (as if shot by
 * Rarezy's own team on intake) served from `public/watches/`; each listing's
 * spec sheet is written to match what's actually in its photo.
 */
function seedRecords(): SellRecord[] {
  const listings: CompetitionListing[] = [
    autoListing(
      {
        brand: "Rolex",
        model: "Submariner Date",
        reference: "16610",
        year: 2007,
        condition: "excellent",
        purchasePrice: 8450,
        description:
          "Rolex Submariner Date 16610 on the Oystersteel bracelet, black dial and bezel. Full set — box, papers and swing tag included. Light wear only, fully serviced by our partner watch specialist prior to listing.",
        photos: ["/watches/rolex-submariner-16610.jpg"],
        movement: "Automatic (Cal. 3135)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Oyster)",
        dialColor: "Black",
        bezelMaterial: "Aluminium, black insert",
        crystal: "Sapphire",
        caseDiameterMm: 40,
        lugWidthMm: 20,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 30, daysElapsed: 21, soldRatio: 0.7, leaderboard: board(24, 986) },
    ),
    autoListing(
      {
        brand: "Rolex",
        model: "Datejust 36",
        reference: "126234",
        year: 2025,
        condition: "excellent",
        purchasePrice: 9500,
        description:
          "Rolex Datejust 36 126234 on the Jubilee bracelet, black dial. The most traditional Datejust variation — 36mm case diameter unchanged since 1945. Full set with manufacturer's warranty card and box.",
        photos: ["/watches/rolex-datejust-126234-black.jpg"],
        movement: "Automatic (Cal. 3235)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Jubilee)",
        dialColor: "Black",
        bezelMaterial: "Fluted, white gold",
        crystal: "Sapphire",
        caseDiameterMm: 36,
        lugWidthMm: 20,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 21, daysElapsed: 6, soldRatio: 0.35, leaderboard: board(14, 940) },
    ),
    autoListing(
      {
        brand: "Rolex",
        model: "Datejust 36",
        reference: "126234",
        year: 2024,
        condition: "good",
        purchasePrice: 8900,
        description:
          "A second Datejust 36 126234, this one on the fluted white gold bezel with a black sunburst dial and Jubilee bracelet. Visible light wear, watch specialist inspected and confirmed fully serviced.",
        photos: [
          "/watches/rolex-datejust-126234-sunburst.jpg",
        ],
        movement: "Automatic (Cal. 3235)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Jubilee)",
        dialColor: "Black sunburst",
        bezelMaterial: "Fluted, white gold",
        crystal: "Sapphire",
        caseDiameterMm: 36,
        lugWidthMm: 20,
        accessories: "Original box, warranty card",
      },
      { deadlineDays: 35, daysElapsed: 12, soldRatio: 0.5, leaderboard: board(18, 955) },
    ),
    autoListing(
      {
        brand: "Rolex",
        model: "Cosmograph Daytona",
        reference: "16520",
        year: 1998,
        condition: "good",
        purchasePrice: 24500,
        description:
          "Rolex Cosmograph Daytona 16520 — the last of the automatic Daytonas with the Zenith-derived El Primero-based movement. Steel case, tachymetric bezel. A modern classic, watch specialist serviced.",
        photos: ["/watches/rolex-daytona-16520.jpg"],
        movement: "Automatic (Cal. 4030)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Oyster)",
        dialColor: "Black",
        bezelMaterial: "Steel, tachymetric",
        crystal: "Sapphire",
        caseDiameterMm: 40,
        lugWidthMm: 20,
        accessories: "Box, service papers",
      },
      { deadlineDays: 30, daysElapsed: 9, soldRatio: 0.4, leaderboard: board(16, 912) },
    ),
    autoListing(
      {
        brand: "Rolex",
        model: "Cosmograph Daytona",
        reference: "116509",
        year: 2016,
        condition: "excellent",
        purchasePrice: 38000,
        description:
          "Rolex Cosmograph Daytona 116509 in 18ct white gold, one of the most refined references in the line. Full set, barely worn, independently authenticated.",
        photos: ["/watches/rolex-daytona-116509.jpg"],
        movement: "Automatic (Cal. 4130)",
        caseMaterial: "18ct white gold",
        braceletMaterial: "18ct white gold (Oyster)",
        dialColor: "White",
        bezelMaterial: "White gold, tachymetric",
        crystal: "Sapphire",
        caseDiameterMm: 40,
        lugWidthMm: 20,
        accessories: "Full set, box and papers",
      },
      { deadlineDays: 45, daysElapsed: 15, soldRatio: 0.3, leaderboard: board(12, 972) },
    ),
    autoListing(
      {
        brand: "Rolex",
        model: "GMT-Master II",
        reference: "116710BLNR",
        year: 2015,
        condition: "excellent",
        purchasePrice: 16800,
        description:
          "Rolex GMT-Master II 116710BLNR, the 'Batman' — black and blue Cerachrom bezel, black dial. Discontinued and highly sought after. Full set, light wear only.",
        photos: ["/watches/rolex-gmt-116710blnr.jpg"],
        movement: "Automatic (Cal. 3186)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Oyster)",
        dialColor: "Black",
        bezelMaterial: "Ceramic, black/blue",
        crystal: "Sapphire",
        caseDiameterMm: 40,
        lugWidthMm: 20,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 21, daysElapsed: 4, soldRatio: 0.55, leaderboard: board(20, 963) },
    ),
    autoListing(
      {
        brand: "Rolex",
        model: "GMT-Master II",
        reference: "16710",
        year: 2003,
        condition: "good",
        purchasePrice: 13500,
        description:
          "Rolex GMT-Master II 16710, the 'Pepsi' — red and blue bezel over a black dial, steel Oyster bracelet. Visible wear consistent with regular use, fully serviced.",
        photos: ["/watches/rolex-gmt-16710.jpg"],
        movement: "Automatic (Cal. 3186)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Oyster)",
        dialColor: "Black",
        bezelMaterial: "Aluminium, red/blue",
        crystal: "Sapphire",
        caseDiameterMm: 40,
        lugWidthMm: 20,
        accessories: "Box, service history",
      },
      { deadlineDays: 30, daysElapsed: 18, soldRatio: 0.6, leaderboard: board(20, 901) },
    ),
    endingInHours(autoListing(
      {
        brand: "Rolex",
        model: "Explorer II",
        reference: "16570",
        year: 2009,
        condition: "excellent",
        purchasePrice: 9200,
        description:
          "Rolex Explorer II 16570, white dial with the signature orange 24-hour GMT hand. Steel case and Oyster bracelet, full set, fully serviced by our partner watch specialist.",
        photos: ["/watches/rolex-explorer-ii-16570.jpg"],
        movement: "Automatic (Cal. 3185)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Oyster)",
        dialColor: "White",
        bezelMaterial: "Steel, fixed 24-hour",
        crystal: "Sapphire",
        caseDiameterMm: 40,
        lugWidthMm: 20,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 14, daysElapsed: 3, soldRatio: 0.25, leaderboard: board(10, 884) },
    ), 2),
    autoListing(
      {
        brand: "Rolex",
        model: "Yacht-Master II",
        reference: "116680",
        year: 2013,
        condition: "excellent",
        purchasePrice: 19500,
        description:
          "Rolex Yacht-Master II 116680, white dial and the programmable Ring Command ceramic bezel for regatta countdowns. Steel case and Oyster bracelet, barely worn.",
        photos: ["/watches/rolex-yachtmaster-116680.jpg"],
        movement: "Automatic (Cal. 4161)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Oyster)",
        dialColor: "White",
        bezelMaterial: "Ceramic, Ring Command",
        crystal: "Sapphire",
        caseDiameterMm: 44,
        lugWidthMm: 20,
        accessories: "Full set, box and papers",
      },
      { deadlineDays: 40, daysElapsed: 22, soldRatio: 0.45, leaderboard: board(16, 933) },
    ),
    autoListing(
      {
        brand: "Rolex",
        model: "Milgauss",
        reference: "116400GV",
        year: 2014,
        condition: "excellent",
        purchasePrice: 9900,
        description:
          "Rolex Milgauss 116400GV, black dial with the distinctive orange lightning-bolt second hand and green-tinted sapphire crystal. Steel case, Oyster bracelet, full set.",
        photos: ["/watches/rolex-milgauss-116400gv.jpg"],
        movement: "Automatic (Cal. 3131)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Oyster)",
        dialColor: "Black",
        bezelMaterial: "Steel, smooth",
        crystal: "Sapphire, green-tinted",
        caseDiameterMm: 40,
        lugWidthMm: 20,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 25, daysElapsed: 8, soldRatio: 0.4, leaderboard: board(14, 895) },
    ),
    autoListing(
      {
        brand: "Patek Philippe",
        model: "Nautilus",
        reference: "5711/1A",
        year: 2023,
        condition: "excellent",
        purchasePrice: 145000,
        description:
          "Discontinued reference 5711/1A in stainless steel, blue dial. One of the most sought-after sports watches in the world — box, papers and original receipt included. Independently authenticated and pressure-tested.",
        photos: ["/watches/patek-nautilus-5711.jpg"],
        movement: "Automatic (Cal. 26-330 S C)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel",
        dialColor: "Blue, horizontally embossed",
        bezelMaterial: "Steel",
        crystal: "Sapphire",
        caseDiameterMm: 40,
        lugWidthMm: 21,
        accessories: "Box, papers, original receipt",
      },
      { deadlineDays: 45, daysElapsed: 10, soldRatio: 0.3, leaderboard: board(12, 992) },
    ),
    autoListing(
      {
        brand: "Audemars Piguet",
        model: "Royal Oak Extra-Thin",
        reference: "15202",
        year: 2021,
        condition: "excellent",
        purchasePrice: 42000,
        description:
          "Audemars Piguet Royal Oak Extra-Thin ref. 15202 in stainless steel, blue 'Grande Tapisserie' dial. Gérald Genta's original 1972 design. Barely worn, full set with warranty card and hangtags.",
        photos: ["/watches/ap-royal-oak-15202.jpg"],
        movement: "Automatic (Cal. 2121)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel",
        dialColor: "Blue, Grande Tapisserie",
        bezelMaterial: "Steel, octagonal",
        crystal: "Sapphire",
        caseDiameterMm: 39,
        lugWidthMm: 21,
        accessories: "Full set, warranty card and hangtags",
      },
      { deadlineDays: 30, daysElapsed: 27, soldRatio: 0.65, leaderboard: board(22, 968) },
    ),
    autoListing(
      {
        brand: "Omega",
        model: "Speedmaster Professional",
        reference: "311.30.42.30.01.005",
        year: 2020,
        condition: "excellent",
        purchasePrice: 5600,
        description:
          "Omega Speedmaster Professional 'Moonwatch', manual-wind chronograph, black dial, steel case and bracelet. The watch worn on the Moon — full set, watch specialist serviced.",
        photos: ["/watches/omega-speedmaster-311.jpg"],
        movement: "Manual-wind chronograph (Cal. 1861)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel",
        dialColor: "Black",
        bezelMaterial: "Steel, tachymetric",
        crystal: "Hesalite",
        caseDiameterMm: 42,
        lugWidthMm: 20,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 14, daysElapsed: 5, soldRatio: 0.5, leaderboard: board(18, 878) },
    ),
    autoListing(
      {
        brand: "Omega",
        model: "Seamaster Planet Ocean",
        reference: "215.30.44.21.03.001",
        year: 2019,
        condition: "excellent",
        purchasePrice: 5200,
        description:
          "Omega Seamaster Planet Ocean 600M, black dial, ceramic bezel, steel case and bracelet. 600m water resistance, Co-Axial movement, full set.",
        photos: [
          "/watches/omega-planet-ocean-215.jpg",
        ],
        movement: "Automatic Co-Axial (Cal. 8500)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel",
        dialColor: "Black",
        bezelMaterial: "Ceramic",
        crystal: "Sapphire",
        caseDiameterMm: 44,
        lugWidthMm: 21,
        accessories: "Box, papers",
      },
      { deadlineDays: 21, daysElapsed: 11, soldRatio: 0.4, leaderboard: board(14, 842) },
    ),
    autoListing(
      {
        brand: "Tudor",
        model: "Black Bay 58 18k Gold",
        reference: "M79018V",
        year: 2022,
        condition: "excellent",
        purchasePrice: 13800,
        description:
          "Tudor Black Bay 58 in solid 18ct yellow gold — the first Tudor made entirely in gold. Gilt dial, domed sapphire crystal, on the matching gold bracelet. Barely worn.",
        photos: [
          "/watches/tudor-bb58-gold.jpg",
        ],
        movement: "Automatic (Cal. MT5400)",
        caseMaterial: "18ct yellow gold",
        braceletMaterial: "18ct yellow gold",
        dialColor: "Gilt",
        bezelMaterial: "18ct gold, black insert",
        crystal: "Domed sapphire",
        caseDiameterMm: 39,
        lugWidthMm: 20,
        accessories: "Full set, box and papers",
      },
      { deadlineDays: 30, daysElapsed: 14, soldRatio: 0.35, leaderboard: board(14, 929) },
    ),
    autoListing(
      {
        brand: "Grand Seiko",
        model: "Snowflake Spring Drive",
        reference: "SBGA011",
        year: 2016,
        condition: "excellent",
        purchasePrice: 4800,
        description:
          "Grand Seiko SBGA011 'Snowflake', titanium case, textured white dial that mimics fresh snow. Spring Drive movement — the smooth sweep of a mechanical watch with quartz-level accuracy.",
        photos: ["/watches/grand-seiko-snowflake.jpg"],
        movement: "Spring Drive (Cal. 9R65)",
        caseMaterial: "Titanium",
        braceletMaterial: "Titanium",
        dialColor: "White, textured 'snowflake'",
        bezelMaterial: "Titanium",
        crystal: "Sapphire",
        caseDiameterMm: 41,
        lugWidthMm: 21,
        accessories: "Box, papers",
      },
      { deadlineDays: 18, daysElapsed: 6, soldRatio: 0.3, leaderboard: board(10, 801) },
    ),
    autoListing(
      {
        brand: "IWC Schaffhausen",
        model: "Portugieser Automatic",
        reference: "IW500712",
        year: 2017,
        condition: "excellent",
        purchasePrice: 7200,
        description:
          "IWC Portugieser Automatic, silver-plated dial with railway-track minute ring and dauphine hands. Steel case on a leather strap. Full set, watch specialist serviced.",
        photos: ["/watches/iwc-portugieser-automatic.jpg"],
        movement: "Automatic (Cal. 52010)",
        caseMaterial: "Steel",
        braceletMaterial: "Leather strap",
        dialColor: "Silver",
        bezelMaterial: "Steel",
        crystal: "Sapphire",
        caseDiameterMm: 42,
        lugWidthMm: 22,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 25, daysElapsed: 9, soldRatio: 0.28, leaderboard: board(10, 834) },
    ),
    autoListing(
      {
        brand: "Jaeger-LeCoultre",
        model: "Reverso Duoface",
        reference: "Q3908420",
        year: 2019,
        condition: "excellent",
        purchasePrice: 9600,
        description:
          "Jaeger-LeCoultre Reverso Duoface, the swivelling rectangular case with a second dial on the reverse for a second time zone. Manual wind, steel case, leather strap.",
        photos: ["/watches/jlc-reverso-duoface.jpg"],
        movement: "Manual-wind (Cal. 854)",
        caseMaterial: "Steel",
        braceletMaterial: "Leather strap",
        dialColor: "Silver / black (dual dial)",
        bezelMaterial: "Steel",
        crystal: "Sapphire",
        caseDiameterMm: 42,
        lugWidthMm: 20,
        accessories: "Box, papers",
      },
      { deadlineDays: 16, daysElapsed: 2, soldRatio: 0.15, leaderboard: board(6, 789) },
    ),
    endingInHours(autoListing(
      {
        brand: "Cartier",
        model: "Santos Galbée",
        reference: "1564",
        year: 2005,
        condition: "good",
        purchasePrice: 4300,
        description:
          "Cartier Santos Galbée ref. 1564, steel and gold case, silver dial with Roman numerals and the signature exposed screws. A design unchanged since 1904. Visible light wear.",
        photos: ["/watches/cartier-santos-galbee.jpg"],
        movement: "Automatic",
        caseMaterial: "Steel and 18ct gold",
        braceletMaterial: "Steel and 18ct gold",
        dialColor: "Silver",
        bezelMaterial: "Gold, exposed screws",
        crystal: "Sapphire",
        caseDiameterMm: 29,
        lugWidthMm: 17,
        accessories: "Box, service history",
      },
      { deadlineDays: 20, daysElapsed: 7, soldRatio: 0.32, leaderboard: board(12, 760) },
    ), 4),
    autoListing(
      {
        brand: "Vacheron Constantin",
        model: "Overseas",
        reference: "4500V/110A-B128",
        year: 2023,
        condition: "excellent",
        purchasePrice: 45000,
        description:
          "Vacheron Constantin Overseas on the integrated steel bracelet, blue dial with the signature 12-sided bezel. Light wear only, fully serviced by our partner watch specialist.",
        photos: ["/watches/vacheron-overseas.jpg"],
        movement: "Automatic (Cal. 5100)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (integrated)",
        dialColor: "Blue",
        bezelMaterial: "Steel, 12-sided",
        crystal: "Sapphire",
        caseDiameterMm: 41,
        lugWidthMm: 21,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 25, daysElapsed: 8, soldRatio: 0.36, leaderboard: board(10, 810) },
    ),
    autoListing(
      {
        brand: "Tag Heuer",
        model: "Monaco",
        reference: "CBL2111.BA0644",
        year: 2022,
        condition: "excellent",
        purchasePrice: 6200,
        description:
          "Tag Heuer Monaco chronograph, the square steel case, blue dial with red accents, steel bracelet. Light wear, fully serviced by our partner specialist.",
        photos: ["/watches/tagheuer-monaco.jpg"],
        movement: "Automatic (Calibre 11)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel",
        dialColor: "Blue",
        bezelMaterial: "Steel",
        crystal: "Sapphire",
        caseDiameterMm: 39,
        lugWidthMm: 20,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 14, daysElapsed: 3, soldRatio: 0.24, leaderboard: board(8, 470) },
    ),
    autoListing(
      {
        brand: "Breitling",
        model: "Chronomat B01 42",
        reference: "AB0134101C1A1",
        year: 2023,
        condition: "excellent",
        purchasePrice: 7800,
        description:
          "Breitling Chronomat B01 42 on the steel Rouleaux bracelet, blue dial. Light wear, fully serviced by our partner specialist.",
        photos: ["/watches/breitling-chronomat.jpg"],
        movement: "Automatic (Cal. B01)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Rouleaux)",
        dialColor: "Blue",
        bezelMaterial: "Steel, rider tabs",
        crystal: "Sapphire",
        caseDiameterMm: 42,
        lugWidthMm: 22,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 18, daysElapsed: 5, soldRatio: 0.29, leaderboard: board(9, 500) },
    ),
    autoListing(
      {
        brand: "Rolex",
        model: "Sky-Dweller",
        reference: "326934",
        year: 2024,
        condition: "excellent",
        purchasePrice: 42000,
        description:
          "Rolex Sky-Dweller on the Oystersteel bracelet, blue dial, fluted 18ct white gold bidirectional bezel. Full set, light wear only.",
        photos: ["/watches/rolex-skydweller.jpg"],
        movement: "Automatic (Cal. 9001)",
        caseMaterial: "Steel and 18ct white gold",
        braceletMaterial: "Steel (Oyster)",
        dialColor: "Blue",
        bezelMaterial: "18ct white gold, fluted",
        crystal: "Sapphire",
        caseDiameterMm: 42,
        lugWidthMm: 21,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 30, daysElapsed: 10, soldRatio: 0.4, leaderboard: board(11, 830) },
    ),
    autoListing(
      {
        brand: "Cartier",
        model: "Panthère de Cartier",
        reference: "WGPN0009",
        year: 2022,
        condition: "excellent",
        purchasePrice: 9800,
        description:
          "Cartier Panthère de Cartier, steel and 18ct yellow gold case and bracelet, silver dial with Roman numerals. Light wear, fully serviced by our partner specialist.",
        photos: ["/watches/cartier-panthere.jpg"],
        movement: "Quartz",
        caseMaterial: "Steel and 18ct yellow gold",
        braceletMaterial: "Steel and 18ct yellow gold",
        dialColor: "Silver",
        bezelMaterial: "Steel and gold",
        crystal: "Sapphire",
        caseDiameterMm: 29,
        lugWidthMm: 15,
        accessories: "Original box, original papers",
      },
      { deadlineDays: 16, daysElapsed: 4, soldRatio: 0.2, leaderboard: board(7, 440) },
    ),
  ];

  /**
   * Real stock outside watches — handbags, jewellery, clothing and
   * electronics — so every category the header search bar counts actually
   * has live listings behind it, not just a placeholder number. Cars were
   * pulled "for now" (seed data removed) but the category and its filters
   * stay in the code, ready to repopulate later. Photos are AI-generated,
   * white-background studio product shots served from `public/`, matching
   * the watch photography's style.
   */
  const otherCategoryListings: CompetitionListing[] = [
    // Handbags.
    autoListing(
      {
        category: "handbag",
        brand: "Hermès",
        model: "Birkin 30",
        year: 2022,
        condition: "excellent",
        purchasePrice: 14000,
        description:
          "Hermès Birkin 30 — hand-stitched leather, among the most recognised luxury handbags in the world. Light wear, authenticated by our partner specialist.",
        photos: ["/handbags/hermes-birkin.jpg"],
        accessories: "Dust bag, authenticity card",
        color: "Black",
        material: "Togo leather",
        size: "30cm",
        hardware: "Gold-tone",
      },
      { deadlineDays: 21, daysElapsed: 5, soldRatio: 0.4, leaderboard: board(11, 520) },
    ),
    autoListing(
      {
        category: "handbag",
        brand: "Chanel",
        model: "Classic Double Flap 2.55",
        year: 2021,
        condition: "excellent",
        purchasePrice: 8800,
        description:
          "Chanel Classic Double Flap, based on the original 2.55 — quilted leather with the signature chain strap. Light wear only.",
        photos: ["/handbags/chanel-classic-flap.jpg"],
        accessories: "Dust bag, authenticity card",
        color: "Black",
        material: "Quilted lambskin leather",
        size: "Medium (25cm)",
        hardware: "Gold-tone",
      },
      { deadlineDays: 21, daysElapsed: 11, soldRatio: 0.55, leaderboard: board(10, 500) },
    ),
    autoListing(
      {
        category: "handbag",
        brand: "Louis Vuitton",
        model: "Bucket GM Shoulder Bag",
        year: 2023,
        condition: "new",
        purchasePrice: 2300,
        description: "Louis Vuitton Bucket GM — large monogram-canvas shoulder bag. Unworn.",
        photos: ["/handbags/lv-bucket-bag.jpg"],
        accessories: "Dust bag",
        color: "Monogram canvas / Natural trim",
        material: "Coated canvas",
        size: "GM (Large)",
        hardware: "Gold-tone",
      },
      { deadlineDays: 14, daysElapsed: 2, soldRatio: 0.18, leaderboard: board(7, 380) },
    ),

    // Clothing.
    autoListing(
      {
        category: "clothing",
        brand: "Moncler",
        model: "Genius down jacket",
        year: 2023,
        condition: "new",
        purchasePrice: 1800,
        description: "Moncler down jacket from the Genius designer-collaboration line. Unworn, tags attached.",
        photos: ["/clothing/moncler-jacket.jpg"],
        accessories: "Garment bag, tags attached",
        color: "Black",
        material: "Quilted nylon, down fill",
        size: "Men's L / EU 52",
      },
      { deadlineDays: 14, daysElapsed: 3, soldRatio: 0.3, leaderboard: board(8, 340) },
    ),
    autoListing(
      {
        category: "clothing",
        brand: "Nike",
        model: "Air Jordan (2023 release)",
        year: 2023,
        condition: "new",
        purchasePrice: 450,
        description: "Nike Air Jordan, 2023 release — deadstock, never worn.",
        photos: ["/clothing/nike-air-jordan.jpg"],
        accessories: "Original box",
        color: "Black/University Red",
        material: "Leather and synthetic upper",
        size: "UK 9 / EU 44",
      },
      { deadlineDays: 10, daysElapsed: 1, soldRatio: 0.12, leaderboard: board(6, 260) },
    ),

    // Electronics.
    autoListing(
      {
        category: "electronics",
        brand: "Apple",
        model: "MacBook Pro",
        year: 2024,
        condition: "new",
        purchasePrice: 2500,
        description: "Apple MacBook Pro — professional-tier laptop, sealed/unopened.",
        photos: ["/electronics/macbook-pro.jpg"],
        accessories: "Original box, charger",
        color: "Space Grey",
        storageCapacity: "512GB SSD",
        screenSize: "14-inch",
        connectivity: "Wi-Fi 6E + Bluetooth 5.3",
      },
      { deadlineDays: 14, daysElapsed: 4, soldRatio: 0.42, leaderboard: board(9, 380) },
    ),
    autoListing(
      {
        category: "electronics",
        brand: "Apple",
        model: "AirPods Max",
        year: 2023,
        condition: "new",
        purchasePrice: 550,
        description: "Apple AirPods Max — over-ear wireless headphones, sealed/unopened.",
        photos: ["/electronics/airpods-max.jpg"],
        accessories: "Original box",
        color: "Space Grey",
        connectivity: "Bluetooth 5.0",
      },
      { deadlineDays: 10, daysElapsed: 2, soldRatio: 0.55, leaderboard: board(10, 420) },
    ),
    autoListing(
      {
        category: "electronics",
        brand: "Leica",
        model: "T (Typ 701)",
        year: 2022,
        condition: "excellent",
        purchasePrice: 1900,
        description: "Leica T (Typ 701) — compact mirrorless camera, aluminium unibody. Light wear only.",
        photos: ["/electronics/leica-t.jpg"],
        accessories: "Original box, strap",
        color: "Silver",
        storageCapacity: "16GB internal + SD card slot",
        screenSize: "3.7-inch touchscreen",
        connectivity: "Wi-Fi",
      },
      { deadlineDays: 14, daysElapsed: 6, soldRatio: 0.35, leaderboard: board(8, 350) },
    ),
    autoListing(
      {
        category: "electronics",
        brand: "Apple",
        model: "iPhone 16 Pro Max",
        year: 2024,
        condition: "new",
        purchasePrice: 1200,
        description: "Apple iPhone 16 Pro Max — current-generation flagship, sealed/unopened.",
        photos: ["/electronics/iphone-16-pro-max.jpg"],
        accessories: "Original box",
        color: "Black Titanium",
        storageCapacity: "256GB",
        screenSize: "6.9-inch",
        connectivity: "5G + Wi-Fi 7",
      },
      { deadlineDays: 10, daysElapsed: 1, soldRatio: 0.6, leaderboard: board(11, 440) },
    ),
    autoListing(
      {
        category: "electronics",
        brand: "Apple",
        model: "iPad Pro 13-inch",
        year: 2024,
        condition: "new",
        purchasePrice: 1600,
        description: "Apple iPad Pro, 13-inch M4 model — sealed/unopened.",
        photos: ["/electronics/ipad-pro.jpg"],
        accessories: "Original box",
        color: "Space Grey",
        storageCapacity: "1TB",
        screenSize: "13-inch",
        connectivity: "Wi-Fi + Cellular",
      },
      { deadlineDays: 12, daysElapsed: 2, soldRatio: 0.3, leaderboard: board(8, 360) },
    ),
    autoListing(
      {
        category: "electronics",
        brand: "Apple",
        model: "Watch Ultra 2",
        year: 2024,
        condition: "new",
        purchasePrice: 800,
        description: "Apple Watch Ultra 2 — natural titanium case, sealed/unopened.",
        photos: ["/electronics/apple-watch-ultra.jpg"],
        accessories: "Original box",
        color: "Natural Titanium",
        screenSize: "49mm",
        connectivity: "GPS + Cellular",
      },
      { deadlineDays: 10, daysElapsed: 1, soldRatio: 0.45, leaderboard: board(9, 400) },
    ),
    autoListing(
      {
        category: "electronics",
        brand: "Apple",
        model: "AirPods Pro 2",
        year: 2024,
        condition: "new",
        purchasePrice: 230,
        description: "Apple AirPods Pro 2 — sealed/unopened.",
        photos: ["/electronics/airpods-pro.jpg"],
        accessories: "Original box",
        color: "White",
        connectivity: "Bluetooth 5.3",
      },
      { deadlineDays: 7, daysElapsed: 1, soldRatio: 0.5, leaderboard: board(7, 300) },
    ),
    autoListing(
      {
        category: "electronics",
        brand: "Apple",
        model: "Mac Studio",
        year: 2023,
        condition: "new",
        purchasePrice: 2800,
        description: "Apple Mac Studio — sealed/unopened.",
        photos: ["/electronics/mac-studio.jpg"],
        accessories: "Original box, cables",
        color: "Silver",
        storageCapacity: "1TB SSD",
        connectivity: "Wi-Fi 6E + Thunderbolt 4",
      },
      { deadlineDays: 14, daysElapsed: 5, soldRatio: 0.33, leaderboard: board(8, 340) },
    ),

    // Jewellery.
    autoListing(
      {
        category: "jewellery",
        brand: "Cartier",
        model: "Love Bracelet",
        year: 2023,
        condition: "excellent",
        purchasePrice: 6800,
        description: "Cartier Love bracelet in 18ct yellow gold — the hinged bangle with signature screw motifs. Light wear only.",
        photos: ["/jewellery/cartier-love-bracelet.jpg"],
        accessories: "Original box, screwdriver",
        material: "18ct yellow gold",
        size: "17cm",
      },
      { deadlineDays: 21, daysElapsed: 6, soldRatio: 0.38, leaderboard: board(9, 480) },
    ),
    autoListing(
      {
        category: "jewellery",
        brand: "Tiffany & Co.",
        model: "Diamond Solitaire Pendant",
        year: 2022,
        condition: "excellent",
        purchasePrice: 4200,
        description: "Tiffany & Co. platinum necklace with a round brilliant diamond solitaire pendant. Light wear only.",
        photos: ["/jewellery/tiffany-diamond-necklace.jpg"],
        accessories: "Original box, authenticity certificate",
        material: "Platinum",
        gemstone: "0.5ct round brilliant diamond",
        size: "16–18 inch chain",
      },
      { deadlineDays: 21, daysElapsed: 4, soldRatio: 0.25, leaderboard: board(7, 400) },
    ),
    autoListing(
      {
        category: "jewellery",
        brand: "Van Cleef & Arpels",
        model: "Vintage Alhambra Bracelet",
        year: 2021,
        condition: "excellent",
        purchasePrice: 5400,
        description: "Van Cleef & Arpels Vintage Alhambra bracelet, 18ct yellow gold with mother-of-pearl clover motifs. Light wear only.",
        photos: ["/jewellery/vca-alhambra-bracelet.jpg"],
        accessories: "Original box, authenticity certificate",
        material: "18ct yellow gold",
        gemstone: "Mother-of-pearl",
        size: "One size",
      },
      { deadlineDays: 18, daysElapsed: 3, soldRatio: 0.29, leaderboard: board(8, 420) },
    ),
    autoListing(
      {
        category: "jewellery",
        brand: "Bulgari",
        model: "Serpenti Viper Ring",
        year: 2023,
        condition: "new",
        purchasePrice: 3600,
        description: "Bulgari Serpenti Viper ring in 18ct rose gold, pavé diamonds, the coiled snake design. Unworn.",
        photos: ["/jewellery/bulgari-serpenti-ring.jpg"],
        accessories: "Original box, authenticity certificate",
        material: "18ct rose gold",
        gemstone: "Pavé diamonds",
        size: "UK size L / EU 52",
      },
      { deadlineDays: 14, daysElapsed: 2, soldRatio: 0.2, leaderboard: board(6, 340) },
    ),

    // More handbags.
    autoListing(
      {
        category: "handbag",
        brand: "Dior",
        model: "Lady Dior Medium",
        year: 2023,
        condition: "excellent",
        purchasePrice: 5600,
        description: "Dior Lady Dior, medium size — cannage-quilted lambskin leather with the signature charms. Light wear only.",
        photos: ["/handbags/dior-lady-dior.jpg"],
        accessories: "Dust bag, authenticity card",
        color: "Black",
        material: "Cannage-quilted lambskin leather",
        size: "Medium",
        hardware: "Gold-tone",
      },
      { deadlineDays: 21, daysElapsed: 7, soldRatio: 0.34, leaderboard: board(9, 470) },
    ),
    autoListing(
      {
        category: "handbag",
        brand: "Gucci",
        model: "GG Marmont Small Shoulder Bag",
        year: 2022,
        condition: "excellent",
        purchasePrice: 1900,
        description: "Gucci GG Marmont small shoulder bag, matelassé chevron leather. Light wear only.",
        photos: ["/handbags/gucci-gg-marmont.jpg"],
        accessories: "Dust bag, authenticity card",
        color: "Black",
        material: "Matelassé leather",
        size: "Small",
        hardware: "Antique gold-tone",
      },
      { deadlineDays: 14, daysElapsed: 3, soldRatio: 0.4, leaderboard: board(8, 400) },
    ),
    autoListing(
      {
        category: "handbag",
        brand: "Prada",
        model: "Re-Edition 2005 Nylon Bag",
        year: 2023,
        condition: "new",
        purchasePrice: 1400,
        description: "Prada Re-Edition 2005 mini nylon bag, Re-Nylon fabric. Unworn.",
        photos: ["/handbags/prada-re-edition.jpg"],
        accessories: "Dust bag",
        color: "Black",
        material: "Re-Nylon",
        size: "Mini",
        hardware: "Silver-tone",
      },
      { deadlineDays: 10, daysElapsed: 1, soldRatio: 0.22, leaderboard: board(6, 300) },
    ),

    // More clothing.
    autoListing(
      {
        category: "clothing",
        brand: "Canada Goose",
        model: "Expedition Parka",
        year: 2023,
        condition: "excellent",
        purchasePrice: 1300,
        description: "Canada Goose Expedition Parka, Arctic-Tech shell with fur-trimmed hood, down fill. Light wear only.",
        photos: ["/clothing/canada-goose-parka.jpg"],
        accessories: "Garment bag",
        color: "Black",
        material: "Arctic-Tech shell, coyote fur trim, down fill",
        size: "Men's L",
      },
      { deadlineDays: 14, daysElapsed: 4, soldRatio: 0.31, leaderboard: board(7, 340) },
    ),
    autoListing(
      {
        category: "clothing",
        brand: "Burberry",
        model: "Heritage Trench Coat (Kensington)",
        year: 2022,
        condition: "excellent",
        purchasePrice: 1900,
        description: "Burberry Heritage trench coat, cotton gabardine, double-breasted with a belted waist. Light wear only.",
        photos: ["/clothing/burberry-trench.jpg"],
        accessories: "Garment bag",
        color: "Honey/Camel",
        material: "Cotton gabardine",
        size: "UK 12 / EU 40",
      },
      { deadlineDays: 14, daysElapsed: 3, soldRatio: 0.26, leaderboard: board(7, 320) },
    ),
    autoListing(
      {
        category: "clothing",
        brand: "Gucci",
        model: "GG Logo Hoodie",
        year: 2023,
        condition: "new",
        purchasePrice: 980,
        description: "Gucci GG logo hoodie, cotton jersey. Unworn, tags attached.",
        photos: ["/clothing/gucci-hoodie.jpg"],
        accessories: "Tags attached",
        color: "Grey",
        material: "Cotton jersey",
        size: "Men's M",
      },
      { deadlineDays: 10, daysElapsed: 1, soldRatio: 0.15, leaderboard: board(5, 260) },
    ),
  ];

  /*
   * Every watch here is a different brand/reference (and photo) to anything
   * in the live catalogue above — a won listing must never look like the
   * exact same watch that's still up for entries.
   */
  const wonListings: CompetitionListing[] = [
    closedListing(
      {
        brand: "Rolex",
        model: "Sea-Dweller Deepsea",
        reference: "116660",
        year: 2013,
        condition: "excellent",
        purchasePrice: 10800,
        description: "Rolex Deepsea Sea-Dweller 116660, blue-to-black 'James Cameron' dial. Full set.",
        photos: [
          "/watches/rolex-deepsea-116660.jpg",
        ],
        movement: "Automatic (Cal. 3135)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel (Oyster)",
        dialColor: "Blue to black gradient",
        bezelMaterial: "Ceramic, black",
        crystal: "Sapphire",
        caseDiameterMm: 44,
        lugWidthMm: 21,
        accessories: "Original box, original papers",
      },
      { daysAgo: 3, leaderboard: board(20, 971) },
    ),
    closedListing(
      {
        brand: "Omega",
        model: "Speedmaster Professional",
        reference: "145.012-67",
        year: 1967,
        condition: "good",
        purchasePrice: 12500,
        description: "Vintage 1967 Omega Speedmaster Professional 145.012, pre-Moonwatch caliber. Watch specialist serviced.",
        photos: ["/watches/omega-speedmaster-vintage.jpg"],
        movement: "Manual-wind chronograph (Cal. 321)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel",
        dialColor: "Black",
        bezelMaterial: "Steel, tachymetric",
        crystal: "Hesalite",
        caseDiameterMm: 42,
        lugWidthMm: 20,
        accessories: "Service papers",
      },
      { daysAgo: 7, leaderboard: board(16, 902) },
    ),
    closedListing(
      {
        brand: "Cartier",
        model: "Tank",
        reference: "WSTA0041",
        year: 2021,
        condition: "excellent",
        purchasePrice: 5200,
        description: "Cartier Tank, the rectangular case Louis Cartier designed in 1917. Steel case, leather strap.",
        photos: ["/watches/cartier-tank.jpg"],
        movement: "Quartz",
        caseMaterial: "Steel",
        braceletMaterial: "Leather strap",
        dialColor: "Silver",
        bezelMaterial: "Steel",
        crystal: "Sapphire",
        caseDiameterMm: 30,
        lugWidthMm: 16,
        accessories: "Box, papers",
      },
      { daysAgo: 10, leaderboard: board(11, 744) },
    ),
    closedListing(
      {
        brand: "Tudor",
        model: "Pelagos",
        reference: "25600TN",
        year: 2022,
        condition: "excellent",
        purchasePrice: 4200,
        description: "Tudor Pelagos, titanium dive watch with helium escape valve. Full set, barely worn.",
        photos: ["/watches/tudor-pelagos.jpg"],
        movement: "Automatic (Cal. MT5612)",
        caseMaterial: "Titanium",
        braceletMaterial: "Titanium",
        dialColor: "Black",
        bezelMaterial: "Ceramic, black",
        crystal: "Sapphire",
        caseDiameterMm: 42,
        lugWidthMm: 22,
        accessories: "Full set, box and papers",
      },
      { daysAgo: 18, leaderboard: board(19, 955) },
    ),
    closedListing(
      {
        brand: "Grand Seiko",
        model: "Heritage Collection",
        reference: "SBGR051",
        year: 2017,
        condition: "excellent",
        purchasePrice: 3900,
        description: "Grand Seiko SBGR051, high-beat automatic movement, steel case and bracelet.",
        photos: ["/watches/grand-seiko-heritage.jpg"],
        movement: "Automatic, high-beat (Cal. 9S65)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel",
        dialColor: "Silver",
        bezelMaterial: "Steel",
        crystal: "Sapphire",
        caseDiameterMm: 40,
        lugWidthMm: 20,
        accessories: "Box, papers",
      },
      { daysAgo: 25, leaderboard: board(9, 793) },
    ),
    closedListing(
      {
        brand: "Patek Philippe",
        model: "Calatrava",
        reference: "5227",
        year: 2020,
        condition: "excellent",
        purchasePrice: 32000,
        description: "Patek Philippe Calatrava 5227, the archetypal round dress watch. 18ct gold case, leather strap.",
        photos: ["/watches/patek-calatrava.jpg"],
        movement: "Automatic (Cal. 324 S C)",
        caseMaterial: "18ct gold",
        braceletMaterial: "Leather strap",
        dialColor: "Silver",
        bezelMaterial: "18ct gold",
        crystal: "Sapphire",
        caseDiameterMm: 39,
        lugWidthMm: 20,
        accessories: "Box, papers, original receipt",
      },
      { daysAgo: 2, leaderboard: board(15, 930) },
    ),
    closedListing(
      {
        brand: "Audemars Piguet",
        model: "Royal Oak Offshore",
        reference: "26470",
        year: 2019,
        condition: "excellent",
        purchasePrice: 28500,
        description: "Audemars Piguet Royal Oak Offshore chronograph, the oversized case Gerald Genta scaled up in 1993.",
        photos: ["/watches/ap-royal-oak-offshore.jpg"],
        movement: "Automatic chronograph (Cal. 3126/3840)",
        caseMaterial: "Steel",
        braceletMaterial: "Rubber strap",
        dialColor: "Black",
        bezelMaterial: "Steel, octagonal",
        crystal: "Sapphire",
        caseDiameterMm: 44,
        lugWidthMm: 23,
        accessories: "Full set, box and papers",
      },
      { daysAgo: 5, leaderboard: board(17, 940) },
    ),
    closedListing(
      {
        brand: "IWC Schaffhausen",
        model: "Big Pilot",
        reference: "IW501001",
        year: 2018,
        condition: "excellent",
        purchasePrice: 11200,
        description: "IWC Big Pilot's Watch, 46mm case with the signature conical crown. Full set.",
        photos: ["/watches/iwc-big-pilot.jpg"],
        movement: "Automatic (Cal. 52110)",
        caseMaterial: "Steel",
        braceletMaterial: "Leather strap",
        dialColor: "Black",
        bezelMaterial: "Steel",
        crystal: "Sapphire",
        caseDiameterMm: 46,
        lugWidthMm: 22,
        accessories: "Full set, box and papers",
      },
      { daysAgo: 8, leaderboard: board(13, 980) },
    ),
    closedListing(
      {
        brand: "Jaeger-LeCoultre",
        model: "Master Control Hometime",
        reference: "147.2.05.S",
        year: 2006,
        condition: "excellent",
        purchasePrice: 6800,
        description: "Jaeger-LeCoultre Master Control Hometime, second time-zone dress watch. Steel case, leather strap.",
        photos: [
          "/watches/jlc-master-control.jpg",
        ],
        movement: "Automatic (Cal. 976)",
        caseMaterial: "Steel",
        braceletMaterial: "Leather strap",
        dialColor: "Silver",
        bezelMaterial: "Steel",
        crystal: "Sapphire",
        caseDiameterMm: 39,
        lugWidthMm: 20,
        accessories: "Box, papers",
      },
      { daysAgo: 11, leaderboard: board(14, 921) },
    ),
    closedListing(
      {
        brand: "Breitling",
        model: "Navitimer",
        reference: "AB0121",
        year: 2017,
        condition: "excellent",
        purchasePrice: 6200,
        description: "Breitling Navitimer chronograph, the slide-rule bezel pilot's watch since 1952. Steel case, full set.",
        photos: ["/watches/breitling-navitimer.jpg"],
        movement: "Automatic chronograph (Cal. B01)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel",
        dialColor: "Black",
        bezelMaterial: "Steel, slide rule",
        crystal: "Sapphire",
        caseDiameterMm: 43,
        lugWidthMm: 22,
        accessories: "Box, papers",
      },
      { daysAgo: 4, leaderboard: board(11, 868) },
    ),
    closedListing(
      {
        brand: "Vacheron Constantin",
        model: "Historiques",
        reference: "222",
        year: 2023,
        condition: "excellent",
        purchasePrice: 34500,
        description: "Vacheron Constantin Historiques 222, the reissued 1977 integrated-bracelet sports watch. Full set.",
        photos: ["/watches/vacheron-historiques-222.jpg"],
        movement: "Automatic (Cal. 2455/2)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel",
        dialColor: "Blue",
        bezelMaterial: "Steel, tonneau",
        crystal: "Sapphire",
        caseDiameterMm: 37,
        lugWidthMm: 19,
        accessories: "Full set, box and papers",
      },
      { daysAgo: 13, leaderboard: board(9, 973) },
    ),
    closedListing(
      {
        brand: "Tag Heuer",
        model: "Carrera",
        reference: "CBK2112",
        year: 2020,
        condition: "excellent",
        purchasePrice: 4300,
        description: "Tag Heuer Carrera chronograph in blue, steel case and bracelet, tachymeter bezel. Full set.",
        photos: ["/watches/tagheuer-carrera.jpg"],
        movement: "Automatic chronograph (Cal. Heuer 02)",
        caseMaterial: "Steel",
        braceletMaterial: "Steel",
        dialColor: "Blue",
        bezelMaterial: "Steel, tachymetric",
        crystal: "Sapphire",
        caseDiameterMm: 44,
        lugWidthMm: 22,
        accessories: "Box, papers",
      },
      { daysAgo: 21, leaderboard: board(13, 831) },
    ),
  ];

  return [...listings, ...otherCategoryListings, ...wonListings];
}

const STORAGE_KEY = "rarezy.state.v15";

function load(): State {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw) as State;
  } catch {
    /* fall through to a fresh seed */
  }
  return { records: seedRecords(), watchlist: [], basket: [], currentUser: null };
}

let state: State = load();

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const persist = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private browsing or storage full — state just won't survive a reload */
  }
};
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  persist();
  emit();
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Anything "live" whose clock has run out moves to its resting state. */
function settleDeadlines() {
  let changed = false;
  const records = state.records.map((r) => {
    if (r.kind !== "competition" || r.status !== "live") return r;
    if (new Date(r.deadlineAt).getTime() > Date.now()) return r;
    changed = true;
    return resolveDeadline(r);
  });
  if (changed) state = { ...state, records };
  return changed;
}

function resolveDeadline(c: CompetitionListing): CompetitionListing {
  const raised = raisedOf(c);
  if (raised >= c.minimumPrice) {
    const winnerName = topOf(c.leaderboard);
    return {
      ...c,
      status: "closed",
      winnerName,
      history: [
        ...c.history,
        {
          at: now(),
          label: `Deadline reached — won by ${winnerName} at ${raised.toLocaleString("en-GB")}`,
        },
      ],
    };
  }
  return {
    ...c,
    status: "awaiting_decision",
    history: [
      ...c.history,
      { at: now(), label: `Deadline reached — under the minimum, awaiting your decision` },
    ],
  };
}

export function useRarezy() {
  if (settleDeadlines()) persist();
  return useSyncExternalStore(subscribe, () => state, () => state);
}

if (typeof window !== "undefined") {
  setInterval(() => {
    if (settleDeadlines()) {
      persist();
      emit();
    }
  }, 15_000);
}

function buildCashDeal(item: LuxuryItem, offer: Valuation, amount: number): CashDeal {
  return {
    id: id(),
    kind: "cash",
    item,
    offer,
    acceptedAmount: amount,
    acceptedAt: now(),
  };
}

function buildConsignmentListing(
  item: LuxuryItem,
  offer: Valuation,
  config: { entryFee: number; minimumPrice: number; deadlineDays: number },
): CompetitionListing {
  const entriesTotal = suggestEntryCount(offer.ceiling, config.entryFee);
  const createdAt = now();
  return {
    id: id(),
    kind: "competition",
    item,
    offer,
    entryFee: config.entryFee,
    entriesTotal,
    entriesSold: 0,
    minimumPrice: config.minimumPrice,
    targetMax: config.entryFee * entriesTotal,
    deadlineDays: config.deadlineDays,
    deadlineAt: new Date(Date.now() + config.deadlineDays * 86_400_000).toISOString(),
    createdAt,
    status: "authenticating",
    myEntries: 0,
    attemptsRemaining: 0,
    leaderboard: [],
    history: [{ at: createdAt, label: "Collected and taken into our safe deposit vault for inspection" }],
  };
}

function requireSubmission(submissionId: string) {
  return state.records.find((r) => r.id === submissionId && r.kind === "submission") as
    | Submission
    | undefined;
}

function updateSubmission(submissionId: string, patch: Partial<Submission>) {
  set({
    records: state.records.map((r) => (r.id === submissionId && r.kind === "submission" ? { ...r, ...patch } : r)),
  });
}

export const rarezy = {
  /**
   * Creates the free guest→member account, picking the username shown on
   * leaderboards and the winners wall. `isAdmin` must come from the
   * server (the `profiles.is_admin` column, which a normal user can never
   * set on themselves — see the `protect_is_admin` trigger) — never derive
   * it from anything the client typed, or any signed-in user could grant
   * themselves the admin dashboard.
   */
  signUp(username: string, opts?: { isAdmin?: boolean }) {
    const trimmed = username.trim();
    if (!trimmed) return;
    set({ currentUser: { username: trimmed, isAdmin: opts?.isAdmin ?? false } });
  },

  logOut() {
    set({ currentUser: null });
  },

  /** Kicks off the review pipeline — nothing is paid or listed until an admin approves it and a rep visit confirms it in person. */
  submitForReview(item: LuxuryItem, purchasedFrom: string) {
    const submittedAt = now();
    const submission: Submission = {
      id: id(),
      kind: "submission",
      item: { ...item, purchasedFrom: purchasedFrom.trim() || undefined },
      submittedAt,
      status: "pending_review",
      history: [{ at: submittedAt, label: "Submitted for review" }],
    };
    set({ records: [submission, ...state.records] });
    return submission;
  },

  /** Admin: the images and details check out — generates the two offers the seller will see in their dashboard. */
  adminApproveSubmission(
    submissionId: string,
    opts: { adminNotes: string; cashLow: number; cashHigh: number; suggestedMinimum: number; ceiling: number },
  ) {
    const s = requireSubmission(submissionId);
    if (!s || s.status !== "pending_review") return;
    updateSubmission(submissionId, {
      status: "offer_ready",
      adminNotes: opts.adminNotes,
      offer: {
        cashLow: opts.cashLow,
        cashHigh: opts.cashHigh,
        suggestedMinimum: opts.suggestedMinimum,
        ceiling: opts.ceiling,
      },
      history: [...s.history, { at: now(), label: "Approved — offer sent to the seller's dashboard" }],
    });
  },

  /** Admin: doesn't check out — images, details or provenance don't add up. */
  adminRejectSubmission(submissionId: string, adminNotes: string) {
    const s = requireSubmission(submissionId);
    if (!s || s.status !== "pending_review") return;
    updateSubmission(submissionId, {
      status: "rejected",
      adminNotes,
      history: [...s.history, { at: now(), label: "Rejected" }],
    });
  },

  /** Seller: picks a direction from their dashboard — this books the collection visit, but nothing is final until it happens. */
  chooseSubmissionOffer(
    submissionId: string,
    choice: "cash" | "consignment",
    ticketTerms?: { entryFee: number; minimumPrice: number; deadlineDays: number },
  ) {
    const s = requireSubmission(submissionId);
    if (!s || s.status !== "offer_ready" || !s.offer) return;
    const scheduledAt = new Date(Date.now() + 2 * 86_400_000 + 10 * 3_600_000).toISOString();
    const repName = randomRepName();
    updateSubmission(submissionId, {
      status: "visit_scheduled",
      sellerChoice: choice,
      proposedEntryFee: choice === "consignment" ? ticketTerms?.entryFee : undefined,
      proposedMinimumPrice: choice === "consignment" ? ticketTerms?.minimumPrice : undefined,
      proposedDeadlineDays: choice === "consignment" ? ticketTerms?.deadlineDays : undefined,
      visit: { scheduledAt, repName },
      history: [
        ...s.history,
        {
          at: now(),
          label: `Chose to proceed with the ${choice === "cash" ? "cash" : "ticketed"} offer — visit booked with ${repName}`,
        },
      ],
    });
  },

  /** Seller: declines both offers outright, no visit booked. */
  cancelSubmission(submissionId: string) {
    const s = requireSubmission(submissionId);
    if (!s || s.status !== "offer_ready") return;
    updateSubmission(submissionId, {
      status: "declined_by_seller",
      history: [...s.history, { at: now(), label: "Declined both offers" }],
    });
  },

  /**
   * Admin: the one-shot decision made at the visit itself. Cash pays out
   * immediately; consignment takes the item into the vault as a new listing
   * (still "authenticating" until the certificate is published); declining
   * voids the submission — the seller would need to resubmit for a fresh
   * approval, since a rep is only sent out once.
   */
  adminCompleteVisit(
    submissionId: string,
    outcome: "cash" | "consignment" | "declined",
    opts: {
      finalCashAmount?: number | undefined;
      finalEntryFee?: number | undefined;
      finalMinimumPrice?: number | undefined;
      finalDeadlineDays?: number | undefined;
    },
  ) {
    const s = requireSubmission(submissionId);
    if (!s || s.status !== "visit_scheduled" || !s.offer) return;

    if (outcome === "declined") {
      updateSubmission(submissionId, {
        status: "declined_at_visit",
        history: [...s.history, { at: now(), label: "Declined both offers at the visit — deal void" }],
      });
      return;
    }

    if (outcome === "cash") {
      const amount = opts.finalCashAmount ?? s.offer.cashHigh;
      const deal = buildCashDeal(s.item, s.offer, amount);
      set({ records: [deal, ...state.records] });
      updateSubmission(submissionId, {
        status: "visit_completed_cash",
        resultRecordId: deal.id,
        history: [...s.history, { at: now(), label: `Took the instant cash offer — ${amount.toLocaleString("en-GB")}` }],
      });
      return;
    }

    const listing = buildConsignmentListing(s.item, s.offer, {
      entryFee: opts.finalEntryFee ?? s.proposedEntryFee ?? 2,
      minimumPrice: opts.finalMinimumPrice ?? s.proposedMinimumPrice ?? s.offer.suggestedMinimum,
      deadlineDays: opts.finalDeadlineDays ?? s.proposedDeadlineDays ?? 30,
    });
    set({ records: [listing, ...state.records] });
    updateSubmission(submissionId, {
      status: "visit_completed_consignment",
      resultRecordId: listing.id,
      history: [...s.history, { at: now(), label: "Consigned — collected into the vault for inspection" }],
    });
  },

  /** Admin: publishes the in-person inspection writeup — this is what puts a vaulted item live on the marketplace. */
  adminPublishAnalysisReport(
    listingId: string,
    report: { inspectorName: string; summary: string; findings: AnalysisReport["findings"] },
  ) {
    const c = state.records.find((r) => r.id === listingId && r.kind === "competition") as
      | CompetitionListing
      | undefined;
    if (!c || c.status !== "authenticating") return;
    const analysisReport: AnalysisReport = {
      certificateId: certId(),
      generatedAt: now(),
      inspectorName: report.inspectorName,
      summary: report.summary,
      findings: report.findings,
    };
    set({
      records: state.records.map((r) =>
        r.id === listingId && r.kind === "competition"
          ? {
              ...r,
              status: "live",
              certificateId: analysisReport.certificateId,
              analysisReport,
              history: [...r.history, { at: now(), label: "Certificate published — live on the marketplace" }],
            }
          : r,
      ),
    });
  },

  toggleWatchlist(listingId: string) {
    const on = state.watchlist.includes(listingId);
    set({
      watchlist: on ? state.watchlist.filter((id_) => id_ !== listingId) : [...state.watchlist, listingId],
    });
  },

  addToBasket(listingId: string, qty = 1) {
    const existing = state.basket.find((b) => b.listingId === listingId);
    set({
      basket: existing
        ? state.basket.map((b) => (b.listingId === listingId ? { ...b, qty: b.qty + qty } : b))
        : [...state.basket, { listingId, qty }],
    });
  },

  setBasketQty(listingId: string, qty: number) {
    if (qty < 1) return;
    set({ basket: state.basket.map((b) => (b.listingId === listingId ? { ...b, qty } : b)) });
  },

  removeFromBasket(listingId: string) {
    set({ basket: state.basket.filter((b) => b.listingId !== listingId) });
  },

  /** Charges the chosen payment method for every ticket in the basket, then applies them all in one go. */
  checkoutBasket(): { ok: true } | { ok: false; reason: "empty" } {
    const items = state.basket
      .map((b) => {
        const c = state.records.find((r) => r.id === b.listingId && r.kind === "competition") as
          | CompetitionListing
          | undefined;
        return c && c.status === "live" ? { c, qty: b.qty } : null;
      })
      .filter((x): x is { c: CompetitionListing; qty: number } => x !== null);

    if (items.length === 0) return { ok: false, reason: "empty" };

    const updates = new Map<string, CompetitionListing>();
    for (const { c, qty } of items) {
      const entriesSold = c.entriesSold + qty;
      const myEntries = c.myEntries + qty;
      const raised = entriesSold * c.entryFee;
      const hitCeiling = raised >= c.targetMax;
      updates.set(c.id, {
        ...c,
        entriesSold,
        myEntries,
        attemptsRemaining: c.attemptsRemaining + qty,
        status: hitCeiling ? "closed" : c.status,
        winnerName: hitCeiling ? topOf(c.leaderboard) : c.winnerName,
        history: [
          ...c.history,
          { at: now(), label: `You bought ${qty} ticket${qty > 1 ? "s" : ""}` },
          ...(hitCeiling
            ? [{ at: now(), label: `Reached ${raised.toLocaleString("en-GB")} — listing closed` }]
            : []),
        ],
      });
    }

    set({
      records: state.records.map((r) => updates.get(r.id) ?? r),
      basket: [],
    });
    return { ok: true };
  },

  /**
   * One play of the skill game, spending one owed attempt. Every merge
   * gain is a power of two of 4 or more (two 2s make a 4, two 4s make an 8,
   * and so on), so a legitimate score is always a non-negative multiple of
   * 4 — real gameplay can never produce anything else. This is a client-only
   * app with no backend to validate moves server-side, so it can't stop a
   * determined attacker from calling this directly, but rejecting scores
   * that couldn't come from real merges at all closes off the most trivial
   * tampering (typing an arbitrary number into the console) for free.
   */
  recordScore(listingId: string, score: number) {
    if (!Number.isInteger(score) || score < 0 || score % 4 !== 0) return;

    const c = state.records.find((r) => r.id === listingId && r.kind === "competition") as
      | CompetitionListing
      | undefined;
    if (!c || c.attemptsRemaining < 1) return;

    const best = Math.max(c.myBestScore ?? 0, score);
    const others = c.leaderboard.filter((e) => !e.isYou);
    const leaderboard = [...others, { name: "You", score: best, isYou: true }].sort(
      (a, b) => b.score - a.score,
    );

    set({
      records: state.records.map((r) =>
        r.id === listingId && r.kind === "competition"
          ? { ...r, attemptsRemaining: r.attemptsRemaining - 1, myBestScore: best, leaderboard }
          : r,
      ),
    });
  },

  /** Under the minimum at the deadline: take the raised amount as-is, paid to a linked payout account. */
  acceptCurrentRaise(listingId: string) {
    const c = requireOwned(listingId);
    if (!c) return;
    const raised = raisedOf(c);
    update(listingId, {
      status: "closed",
      winnerName: topOf(c.leaderboard),
      history: [...c.history, { at: now(), label: `Accepted the raised amount — ${raised.toLocaleString("en-GB")}` }],
    });
  },

  /** Under the minimum: our partner watch specialist's first-refusal cash offer, paid to a linked payout account. */
  takePartnerOffer(listingId: string) {
    const c = requireOwned(listingId);
    if (!c) return;
    const amount = c.offer.cashHigh;
    update(listingId, {
      status: "partner_settled",
      entriesSold: 0,
      myEntries: 0,
      attemptsRemaining: 0,
      history: [...c.history, { at: now(), label: `Sold to our partner watch specialist — ${amount.toLocaleString("en-GB")}` }],
    });
  },

  /** Under the minimum: reopen with a fresh deadline. */
  relist(listingId: string, deadlineDays: number) {
    const c = requireOwned(listingId);
    if (!c) return;
    update(listingId, {
      status: "live",
      entriesSold: 0,
      myEntries: 0,
      attemptsRemaining: 0,
      myBestScore: undefined,
      leaderboard: [],
      deadlineDays,
      deadlineAt: new Date(Date.now() + deadlineDays * 86_400_000).toISOString(),
      history: [...c.history, { at: now(), label: `Relisted for another ${deadlineDays} days` }],
    });
  },

  /** Under the minimum: send it back. */
  returnItem(listingId: string) {
    const c = requireOwned(listingId);
    if (!c) return;
    update(listingId, {
      status: "returned",
      history: [...c.history, { at: now(), label: "Item shipped back to the seller" }],
    });
  },

  /** The demo clock — jump a live listing straight to its deadline. */
  previewDeadline(listingId: string) {
    const c = state.records.find((r) => r.id === listingId && r.kind === "competition") as
      | CompetitionListing
      | undefined;
    if (!c || c.status !== "live") return;
    set({
      records: state.records.map((r) =>
        r.id === listingId ? resolveDeadline({ ...(r as CompetitionListing), deadlineAt: now() }) : r,
      ),
    });
  },
};

function requireOwned(listingId: string) {
  const c = state.records.find((r) => r.id === listingId && r.kind === "competition") as
    | CompetitionListing
    | undefined;
  if (!c || c.isHouseStock || c.status !== "awaiting_decision") return undefined;
  return c;
}

function update(listingId: string, patch: Partial<CompetitionListing>) {
  set({
    records: state.records.map((r) => (r.id === listingId && r.kind === "competition" ? { ...r, ...patch } : r)),
  });
}
