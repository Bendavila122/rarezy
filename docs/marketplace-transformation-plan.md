# Rarezy → multi-sided marketplace: technical assessment & migration plan

Phase 1 deliverable, per the master objective doc. This is an honest inventory
of what exists today, the single biggest architectural fact that shapes
everything else, and a re-sequenced phase plan. No feature code has been
written against this yet — it's the assessment the master doc's Phase 1 asks
for, to align on before any of it starts.

## 0. The one fact that changes everything

**There is no real backend for marketplace data today.** Rarezy is a Vite +
React SPA. The *only* server-side infrastructure is Supabase Auth plus four
small edge functions (email verification codes, username availability, and
Stripe **Identity** — KYC document checks, not payments). Every competition,
entry, basket, cash offer, submission and admin review currently lives in a
single JS object in `src/lib/store.ts`, persisted to one browser's
`localStorage`. There is no `stripe` package in `package.json` and no
payment-intent code anywhere — `checkoutBasket()` just mutates local state;
no money moves today, real or simulated-via-API.

This is exactly right for what the app has been so far: a single-account,
single-browser product demo. It cannot become what the master doc describes
without a real shared database, because:

- Two different sellers' dashboards, an admin console, and thousands of
  customers all need to see and act on **the same** competitions, entries and
  balances — `localStorage` is private to one browser by definition.
- Prices, entry counts, competition status, and payouts must be
  server-authoritative (section 43 says this explicitly) — nothing running
  only in a customer's own tab can be trusted for money.

So "Phase 1" isn't really "add roles to the existing store" — it's **stand up
a real Postgres schema (Supabase, which is already in place) with RLS, and
move competitions/entries/orders/ledger/disputes off the client and onto it,
behind either RLS-scoped direct queries or edge functions for anything that
needs to be server-authoritative (pricing, entry limits, payment
confirmation, payouts).** The existing `profiles` table + `is_admin` flag +
trigger-based protection (just built for the admin account) is the first
real piece of this and the pattern to extend.

## 1. What transfers directly (keep, don't rebuild)

- **Visual language & component library** — the gold/mint dark glass
  aesthetic, `.card`/`.glass-dark`/`.glass-block`/`.press` utilities, the
  homepage's `ScrollStory`/`EndingSoonSection`/`GameSection` sections,
  `NavBar`, `Footer`, `ListingCard`, `FilterDrawer`. Section 2 of the master
  doc is explicit about this, and it's genuinely reusable — competition
  cards, detail pages and browse/filter UX barely need to change shape, just
  wiring to real data instead of the local store.
- **The skill-game competition mechanic** (`SkillGame`/`GameSection`,
  leaderboard model) — section 48 wants this preserved and seller-agnostic,
  which it already is structurally (a listing has a leaderboard; nothing
  about it assumes Rarezy owns the product).
- **Supabase Auth + `profiles` table**, now with `is_admin` — becomes the
  base for the three-role system (section 34), extended with a `role` or
  `seller_id` linkage rather than replaced.
- **The just-built admin submission/certificate pipeline** — conceptually
  becomes the *product/competition approval queue* (sections 17, 26), and
  the certificate-of-authenticity template is directly reusable for however
  much authenticity signalling the new model keeps (see open question below).
- **Stripe Identity (KYC)** — reusable for seller verification (section 13),
  not just customer ID checks.

## 2. What must be newly built (the real work)

Roughly in the master doc's own dependency order:

1. **Real data layer.** Postgres tables for sellers, seller_applications,
   products, product_images, competitions, entries, orders, transactions,
   seller_ledger, fulfilment, disputes, notifications, audit_logs (section
   33's list is a solid starting schema). RLS policies per role, mirroring
   the `protect_is_admin` trigger pattern for anything a client must never
   be able to self-grant (payout amounts, order status, is_admin, etc.).
2. **Real payments.** Stripe Checkout/Payment Intents for entry purchases,
   server-side fee calculation (configurable, not hard-coded — section 46),
   webhook-driven order confirmation. This is a from-scratch build; nothing
   today does this.
3. **Stripe Connect for seller payouts** (implied by section 12/49) — this
   is the part that isn't purely a coding task: it requires *you* to apply
   for and configure a Stripe Connect platform (Express or Custom accounts),
   which involves Stripe's own business review. I can build the integration
   once that's set up; I can't create the Connect platform on your behalf.
4. **Seller portal**: onboarding wizard, dashboard, competition creation
   wizard, marketing generator, fulfilment workflow — all new.
5. **Admin console expansion**: seller approval, competition approval,
   disputes, compliance history, payouts, audit log viewer — extends the
   `/admin` pattern just built, but is a large surface on its own.
6. **Notification system** — in-app centre + email (Resend, already listed
   as current stack) for the ~25 event types across sections 40–41.
7. **Marketing asset generator** — genuinely novel scope (image compositing
   with product photo + branding + CTA, per-channel formats). Worth scoping
   as its own mini-project once the core marketplace works, not bundled in
   early.

## 3. Not a code problem — needs your decision or action

- **UK prize competition law.** A single skill-based competition run by
  Rarezy is one thing; a marketplace where *any approved third-party
  business* runs its own competition is a materially bigger compliance
  surface — each listing needs its own valid "additional skill/knowledge
  test" structure and free-entry route to stay outside the Gambling Act
  2005's definition of a lottery, and Rarezy likely carries some
  responsibility for policing that across every seller. This needs legal
  sign-off on the seller terms (section 6) before sellers go live, not
  just an "I confirm this is accurate" checkbox.
- **Stripe Connect application** — as above, needs you to actually apply.
- **Whether Rarezy still authenticates/insures anything.** The master doc
  says Rarezy should *not* generally handle products (section 1), which
  directly retires the vault/certificate/insured-collection-visit pipeline
  built earlier this session for Rarezy-owned stock. Worth confirming: does
  authentication become optional/seller-supplied, or does Rarezy keep
  offering it as a premium add-on for sellers who want it? The certificate
  UI is reusable either way, but the business rule changes what triggers it.
- **Existing seed "house stock" inventory** (~70 watches/cars/jewellery
  currently listed as if Rarezy owns them) — under the new model these read
  as Rarezy being its own seller. Fine as a bootstrap seller account, but
  worth deciding explicitly rather than leaving ambiguous.

## 4. Re-sequenced phase plan

The master doc's phases are reordered slightly so each phase ships something
real and testable rather than building infrastructure with nothing visible
on top of it for a long stretch.

| Phase | Scope | Depends on |
|---|---|---|
| **A** | Homepage/nav copy pass to marketplace positioning (sections 35–37) — pure content, no architecture change, ships same day. | Nothing |
| **B** | Real data layer: schema + RLS for sellers/products/competitions/entries, migrated off `localStorage`. Customer browse/detail pages read from it (still Rarezy-only sellers for now). | — |
| **C** | Three-role auth: seller role + seller-scoped access, extending the `is_admin` pattern. Seller application + admin approval flow. | B |
| **D** | Real payments: Stripe Checkout for entries, configurable fee, webhook-confirmed orders, transaction ledger. | B |
| **E** | Seller competition creation wizard + admin competition approval queue. | B, C |
| **F** | Seller dashboard (overview, sales, balance) using the real ledger from D. | D, E |
| **G** | Winner/fulfilment workflow + customer "My Wins" + basic disputes. | E |
| **H** | Stripe Connect payouts. | D + your Connect application |
| **I** | Notifications (email via Resend + in-app centre). | C onward, additive |
| **J** | Marketing asset generator + seller storefronts + attribution tracking. | F |
| **K** | Full admin compliance/sanctions system, SEO structure, analytics events. | Ongoing, additive throughout |

Each phase is independently shippable and testable against the existing
"don't break what works" priority — nothing in A–D removes customer browsing
or the game mechanic; it swaps their data source.

## 5. Immediate recommendation

Start with **Phase A** (content/copy — low risk, immediately visible,
zero architecture change) in parallel with beginning **Phase B** (the real
schema), since B is the genuine long pole and everything else depends on it.
Phase B alone is a substantial multi-session build (schema + RLS + migrating
every existing store.ts read/write path).

Before starting B, I need a decision on the open questions in §3 — in
particular the authentication/vault question, since it determines whether
the certificate pipeline gets carried forward as-is or reworked as an
optional seller add-on.
