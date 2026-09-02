/**
 * Partner services for watch owners — insurance, storage, servicing and so
 * on. These are placeholder partners for the demo; wire in real links when
 * partnerships are signed. Presented to the user as ordinary recommended
 * services, not flagged as "affiliate" anywhere in the UI.
 */
export type AffiliatePartner = {
  id: string;
  name: string;
  category: string;
  blurb: string;
  cta: string;
};

export type FeaturedAffiliate = {
  id: string;
  partner: string;
  category: string;
  headline: string;
  blurb: string;
  cta: string;
  image: string;
  href?: string;
};

/**
 * The three partner relationships big enough to earn their own promo banner
 * on the homepage. Presented as recommended services for a watch owner — not
 * labelled "affiliate" in the UI. Photography sourced from Wikimedia Commons
 * under CC licences.
 */
export const FEATURED_AFFILIATES: FeaturedAffiliate[] = [
  {
    id: "travel",
    partner: "Aurea Private Travel",
    category: "Travel",
    headline: "Just won? Take it somewhere worth wearing it.",
    blurb: "Preferential rates on private villas, yachts and first-class travel, arranged by Aurea.",
    cta: "Coming soon",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/49/Lady_M_yacht.jpg",
  },
  {
    id: "insurance",
    partner: "Vault Watch Insurance",
    category: "Insurance",
    headline: "Insure it before you wear it",
    blurb: "Specialist cover for luxury watches, priced on today's market value in minutes, not weeks.",
    cta: "Get a quote",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/35/Ocean_National_Bank_vault_door.png",
    href: "/partners",
  },
  {
    id: "authentication",
    partner: "Verity Authentication",
    category: "Authentication",
    headline: "Get a second opinion, independently",
    blurb: "Not selling yet? Get a watch certified on its own — no listing required, ever.",
    cta: "Learn more",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/88/Benrus_Watch_Balance_Wheel_2.jpg",
    href: "/authenticate",
  },
];

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: "insure",
    name: "Vault Watch Insurance",
    category: "Insurance",
    blurb: "Specialist cover for luxury watches, priced on today's market value.",
    cta: "Get a quote",
  },
  {
    id: "winder",
    name: "Rotare Winders",
    category: "Accessories",
    blurb: "Handmade watch winders that keep an automatic ticking between wears.",
    cta: "Shop winders",
  },
  {
    id: "service",
    name: "Meridian Watch Service",
    category: "Servicing",
    blurb: "Independent watchmakers offering full movement servicing, UK-wide.",
    cta: "Book a service",
  },
  {
    id: "strap",
    name: "Loop & Barton Straps",
    category: "Accessories",
    blurb: "Leather and rubber straps made to fit your exact reference.",
    cta: "Browse straps",
  },
  {
    id: "safe",
    name: "Sentry Home Safes",
    category: "Storage",
    blurb: "Fire-rated safes sized for a growing watch collection.",
    cta: "See safes",
  },
  {
    id: "appraisal",
    name: "Ledger Appraisals",
    category: "Valuation",
    blurb: "Independent written valuations, accepted by every major insurer.",
    cta: "Request appraisal",
  },
];
