/**
 * Verified dealers whose stock appears on Rarezy — pure data, no JSX, like
 * the rest of `lib`. Distinct from the real Supabase `sellers` table (see
 * `@/lib/db`): that's the live business-seller signup pipeline, reachable
 * only via a seller's own dashboard right now and not yet surfaced in
 * Browse. This roster is what actually backs every listing a shopper sees
 * today, the same way `SEED_PLAYERS` in `store.ts` backs leaderboard names —
 * realistic, consistent identities rather than a bare "Rarezy" label on
 * every card.
 */
export type Dealer = {
  id: string;
  name: string;
  tagline: string;
  location: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  memberSince: number;
  verified: boolean;
};

export const DEALERS: readonly Dealer[] = [
  {
    id: "mayfair-vintage",
    name: "Mayfair Vintage Watches",
    tagline: "Specialist dealer in pre-owned luxury watches",
    location: "London, UK",
    rating: 4.9,
    reviewCount: 312,
    soldCount: 841,
    memberSince: 2018,
    verified: true,
  },
  {
    id: "hatton-garden-luxe",
    name: "Hatton Garden Luxe",
    tagline: "Fine watches and jewellery, three generations in the trade",
    location: "London, UK",
    rating: 4.8,
    reviewCount: 264,
    soldCount: 703,
    memberSince: 2016,
    verified: true,
  },
  {
    id: "northern-timepiece-co",
    name: "Northern Timepiece Co.",
    tagline: "Independent watch dealer, est. Manchester",
    location: "Manchester, UK",
    rating: 4.7,
    reviewCount: 198,
    soldCount: 512,
    memberSince: 2020,
    verified: true,
  },
  {
    id: "the-vault-edinburgh",
    name: "The Vault Edinburgh",
    tagline: "Authenticated luxury watches and accessories",
    location: "Edinburgh, UK",
    rating: 4.9,
    reviewCount: 176,
    soldCount: 389,
    memberSince: 2021,
    verified: true,
  },
  {
    id: "regent-street-watch-co",
    name: "Regent Street Watch Co.",
    tagline: "Trusted dealer in rare and discontinued references",
    location: "London, UK",
    rating: 4.6,
    reviewCount: 221,
    soldCount: 617,
    memberSince: 2017,
    verified: true,
  },
  {
    id: "bristol-horology",
    name: "Bristol Horology House",
    tagline: "Family-run, specialising in vintage chronographs",
    location: "Bristol, UK",
    rating: 4.8,
    reviewCount: 143,
    soldCount: 298,
    memberSince: 2019,
    verified: true,
  },
  {
    id: "crown-and-caliber-uk",
    name: "Crown & Caliber UK",
    tagline: "Certified pre-owned watches, fully serviced",
    location: "Birmingham, UK",
    rating: 4.7,
    reviewCount: 187,
    soldCount: 456,
    memberSince: 2020,
    verified: true,
  },
  {
    id: "kensington-jewellers",
    name: "Kensington Jewellers & Co.",
    tagline: "Fine jewellery and watches since 2015",
    location: "London, UK",
    rating: 4.9,
    reviewCount: 205,
    soldCount: 534,
    memberSince: 2015,
    verified: true,
  },
] as const;

export function dealerById(id: string | undefined): Dealer | undefined {
  return DEALERS.find((d) => d.id === id);
}
