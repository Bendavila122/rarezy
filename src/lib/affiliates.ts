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
  /** A real, signed partner's live embed — renders instead of the disabled "coming soon" button. */
  widgetSrc?: string;
};

export type LiveTravelAd = {
  id: string;
  name: string;
  blurb: string;
  widgetSrc: string;
};

/**
 * Real, signed Travelpayouts embeds, rendered via `AffiliateWidgetEmbed`
 * in the "Before you fly" section at the bottom of the Home page — not
 * the (no-longer-linked) Partners page. Add another real partner here as
 * they're signed; each just needs its own widget src.
 */
export const LIVE_TRAVEL_ADS: LiveTravelAd[] = [
  {
    id: "esim",
    name: "Airalo",
    blurb: "Instant eSIM data plans in 200+ countries — install before you fly, skip the roaming charges.",
    widgetSrc:
      "https://tpwgt.com/content?trs=570524&shmarker=773972.rarezy&locale=en&powered_by=true&color_button=%23f2685f&color_focused=%23f2685f&secondary=%23FFFFFF&dark=%2311100f&light=%23FFFFFF&special=%23C4C4C4&border_radius=5&plain=false&no_labels=true&promo_id=8588&campaign_id=541",
  },
  {
    id: "flights",
    name: "Kiwi.com",
    blurb: "Compare flights across hundreds of airlines and book direct.",
    widgetSrc:
      "https://tpwgt.com/content?currency=gbp&trs=570524&shmarker=773972.rarezy&locale=en&powered_by=false&limit=4&primary_color=00AE98&results_background_color=FFFFFF&form_background_color=FFFFFF&promo_id=4563&campaign_id=111",
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
