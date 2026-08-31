import { useSyncExternalStore } from "react";
import {
  entryPricing,
  estimateValue,
  randomPlayerName,
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
  /** entryFee * entriesTotal — reach it and the competition closes early. */
  targetMax: number;
  deadlineDays: number;
  deadlineAt: string;
  createdAt: string;
  status: CompetitionStatus;
  certificateId?: string | undefined;
  /** Entries bought by the signed-in player, not the fictitious field. */
  myEntries: number;
  /** Attempts at the skill game still owed for those entries. */
  attemptsRemaining: number;
  myBestScore?: number | undefined;
  /** Top of the leaderboard — not every entrant, just who's in contention. */
  leaderboard: LeaderboardEntry[];
  winnerName?: string | undefined;
  /** Seeded stock More4Me already owns — bought back and re-entered for the house. */
  isHouseStock?: boolean | undefined;
  history: HistoryEntry[];
};

export type SellRecord = CashDeal | CompetitionListing;

type Wallet = { balance: number };
type State = { wallet: Wallet; records: SellRecord[] };

const id = () => Math.random().toString(36).slice(2, 9);
const certId = () => `M4M-CERT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const now = () => new Date().toISOString();
const round2 = (n: number) => Math.round(n * 100) / 100;
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
    history: [{ at: createdAt, label: "Authenticated by our partner jeweller and listed" }],
  };
}

/**
 * A few pieces More4Me already holds in the safe deposit — bought back at an
 * instant cash offer, then re-entered into competition for the maximum price.
 */
function seedRecords(): SellRecord[] {
  return [
    seedListing(
      {
        category: "watches",
        brand: "Rolex",
        model: "Submariner Date",
        reference: "126610LN",
        year: 2026,
        condition: "excellent",
        purchasePrice: 8450,
      },
      {
        entryFee: 2,
        entriesTotal: 5500,
        minimumPrice: 9800,
        deadlineDays: 30,
        entriesSold: 3860,
        daysElapsed: 21,
        isHouseStock: true,
        leaderboard: [
          { name: "R. Fontaine", score: 986 },
          { name: "K. Ferreira", score: 971 },
          { name: "S. Iyer", score: 958 },
          { name: "M. Okonkwo", score: 944 },
          { name: "J. Laurent", score: 921 },
          { name: "A. Whitfield", score: 903 },
        ],
      },
    ),
    seedListing(
      {
        category: "watches",
        brand: "Patek Philippe",
        model: "Nautilus",
        reference: "5711/1A",
        year: 2023,
        condition: "excellent",
        purchasePrice: 145000,
      },
      {
        entryFee: 25,
        entriesTotal: 7540,
        minimumPrice: 165000,
        deadlineDays: 45,
        entriesSold: 2210,
        daysElapsed: 10,
        isHouseStock: true,
        leaderboard: [
          { name: "P. Nakamura", score: 992 },
          { name: "D. Osei", score: 979 },
          { name: "C. Meng", score: 950 },
          { name: "L. Bergström", score: 918 },
        ],
      },
    ),
    seedListing(
      {
        category: "handbags",
        brand: "Hermès",
        model: "Birkin 30",
        reference: "Togo Gold Hardware",
        year: 2024,
        condition: "excellent",
        purchasePrice: 16200,
      },
      {
        entryFee: 5,
        entriesTotal: 4230,
        minimumPrice: 18800,
        deadlineDays: 30,
        entriesSold: 3990,
        daysElapsed: 27,
        isHouseStock: true,
        leaderboard: [
          { name: "S. Iyer", score: 968 },
          { name: "A. Whitfield", score: 940 },
          { name: "K. Ferreira", score: 902 },
        ],
      },
    ),
    seedListing(
      {
        category: "jewellery",
        brand: "Van Cleef & Arpels",
        model: "Alhambra Necklace",
        reference: "20-motif",
        year: 2022,
        condition: "good",
        purchasePrice: 9800,
      },
      {
        entryFee: 2,
        entriesTotal: 6300,
        minimumPrice: 11000,
        deadlineDays: 21,
        entriesSold: 1140,
        daysElapsed: 5,
        isHouseStock: true,
        leaderboard: [
          { name: "M. Okonkwo", score: 911 },
          { name: "R. Fontaine", score: 887 },
        ],
      },
    ),
  ];
}

const STORAGE_KEY = "more4me.state";

function load(): State {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) return JSON.parse(raw) as State;
  } catch {
    /* fall through to a fresh seed */
  }
  return { wallet: { balance: 250 }, records: seedRecords() };
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

export function useMore4Me() {
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

export const more4me = {
  topUp(amount: number) {
    set({ wallet: { balance: round2(state.wallet.balance + amount) } });
  },

  /** Instant cash offer, accepted on the spot — deposited straight into the wallet. */
  acceptCash(item: LuxuryItem, offer: Valuation, amount: number) {
    const deal: CashDeal = {
      id: id(),
      kind: "cash",
      item,
      offer,
      acceptedAmount: amount,
      acceptedAt: now(),
    };
    set({
      wallet: { balance: round2(state.wallet.balance + amount) },
      records: [deal, ...state.records],
    });
    return deal;
  },

  /** Ship it in — our partner jeweller authenticates, certifies and lists it. */
  startCompetition(
    item: LuxuryItem,
    config: { entryFee: number; entriesTotal: number; minimumPrice: number; deadlineDays: number },
  ) {
    const offer = estimateValue(item);
    const createdAt = now();
    const listing: CompetitionListing = {
      id: id(),
      kind: "competition",
      item,
      offer,
      entryFee: config.entryFee,
      entriesTotal: config.entriesTotal,
      entriesSold: 0,
      minimumPrice: config.minimumPrice,
      targetMax: config.entryFee * config.entriesTotal,
      deadlineDays: config.deadlineDays,
      deadlineAt: new Date(Date.now() + config.deadlineDays * 86_400_000).toISOString(),
      createdAt,
      status: "authenticating",
      myEntries: 0,
      attemptsRemaining: 0,
      leaderboard: [],
      history: [{ at: createdAt, label: "Shipped to our partner jeweller for authentication" }],
    };
    set({ records: [listing, ...state.records] });

    // The authentication pass — checked, certified and photographed, free of
    // charge, and quick enough here to watch happen.
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        set({
          records: state.records.map((r) =>
            r.id === listing.id && r.kind === "competition"
              ? {
                  ...r,
                  status: "live",
                  certificateId: certId(),
                  history: [...r.history, { at: now(), label: "Authenticated, certified and listed" }],
                }
              : r,
          ),
        });
      }, 3200);
    }
    return listing;
  },

  /** A player buys entries into a live competition, paid from their wallet. */
  enter(listingId: string, quantity: number) {
    const c = state.records.find((r) => r.id === listingId && r.kind === "competition") as
      | CompetitionListing
      | undefined;
    if (!c || c.status !== "live" || quantity < 1) return;

    const { charge } = entryPricing(c.entryFee);
    const cost = round2(charge * quantity);
    if (cost > state.wallet.balance) return;

    const entriesSold = c.entriesSold + quantity;
    const myEntries = c.myEntries + quantity;
    const raised = entriesSold * c.entryFee;
    const hitCeiling = raised >= c.targetMax;

    const updated: CompetitionListing = {
      ...c,
      entriesSold,
      myEntries,
      attemptsRemaining: c.attemptsRemaining + quantity,
      status: hitCeiling ? "closed" : c.status,
      winnerName: hitCeiling ? topOf(c.leaderboard) : c.winnerName,
      history: [
        ...c.history,
        { at: now(), label: `You bought ${quantity} ${quantity > 1 ? "entries" : "entry"}` },
        ...(hitCeiling ? [{ at: now(), label: `Reached ${raised.toLocaleString("en-GB")} — competition closed` }] : []),
      ],
    };
    set({
      wallet: { balance: round2(state.wallet.balance - cost) },
      records: state.records.map((r) => (r.id === listingId ? updated : r)),
    });
  },

  /** One play of the skill game, spending one owed attempt. */
  recordScore(listingId: string, score: number) {
    const c = state.records.find((r) => r.id === listingId && r.kind === "competition") as
      | CompetitionListing
      | undefined;
    if (!c || c.attemptsRemaining < 1) return;

    const best = Math.max(c.myBestScore ?? 0, score);
    const others = c.leaderboard.filter((e) => !e.isYou);
    const leaderboard = [...others, { name: "You", score: best, isYou: true }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    set({
      records: state.records.map((r) =>
        r.id === listingId && r.kind === "competition"
          ? { ...r, attemptsRemaining: r.attemptsRemaining - 1, myBestScore: best, leaderboard }
          : r,
      ),
    });
  },

  /** Under the minimum at the deadline: take the raised amount as-is. */
  acceptCurrentRaise(listingId: string) {
    const c = requireOwned(listingId);
    if (!c) return;
    const raised = raisedOf(c);
    update(listingId, {
      status: "closed",
      winnerName: topOf(c.leaderboard),
      history: [...c.history, { at: now(), label: `Accepted the raised amount — ${raised.toLocaleString("en-GB")}` }],
    });
    set({ wallet: { balance: round2(state.wallet.balance + raised) } });
  },

  /** Under the minimum: our partner jeweller's first-refusal cash offer. */
  takePartnerOffer(listingId: string) {
    const c = requireOwned(listingId);
    if (!c) return;
    const amount = c.offer.cashHigh;
    const refund = c.myEntries > 0 ? round2(c.myEntries * c.entryFee) : 0;
    update(listingId, {
      status: "partner_settled",
      entriesSold: 0,
      myEntries: 0,
      attemptsRemaining: 0,
      history: [...c.history, { at: now(), label: `Sold to our partner jeweller — ${amount.toLocaleString("en-GB")}` }],
    });
    set({ wallet: { balance: round2(state.wallet.balance + amount + refund) } });
  },

  /** Under the minimum: refund the room, reopen with a fresh deadline. */
  relist(listingId: string, deadlineDays: number) {
    const c = requireOwned(listingId);
    if (!c) return;
    const refund = c.myEntries > 0 ? round2(c.myEntries * c.entryFee) : 0;
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
    if (refund > 0) set({ wallet: { balance: round2(state.wallet.balance + refund) } });
  },

  /** Under the minimum: send it back. Every entry is refunded, the fee isn't. */
  returnItem(listingId: string) {
    const c = requireOwned(listingId);
    if (!c) return;
    const refund = c.myEntries > 0 ? round2(c.myEntries * c.entryFee) : 0;
    update(listingId, {
      status: "returned",
      history: [...c.history, { at: now(), label: "Item shipped back to the seller" }],
    });
    if (refund > 0) set({ wallet: { balance: round2(state.wallet.balance + refund) } });
  },

  /** The demo clock — jump a live competition straight to its deadline. */
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
