# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start the Vite dev server (http://127.0.0.1:5173)
npm run build     # tsc --noEmit type-check, then vite build
npm run preview   # serve the production build locally
npm run lint      # eslint .
```

There is no test suite configured.

## Architecture

This is a standalone Vite + React 19 + TypeScript app (no backend, no
payment processor). All state lives client-side and is persisted to
`localStorage`, so a page refresh doesn't lose progress. Styling is Tailwind
v4 via `@tailwindcss/vite`, with the color palette (gold/black luxury theme)
defined as CSS custom properties in `src/index.css` using an `@theme` block
rather than a `tailwind.config` file. The `@` import alias maps to `src/`
(configured in both `tsconfig.json` and `vite.config.ts`).

Routing is `react-router-dom` (`BrowserRouter`), wired up directly in
`src/App.tsx` — five routes, no nesting or file-based conventions.

### Domain logic vs. state

The app splits cleanly into two library files:

- **`src/lib/marketplace.ts`** — pure functions and types, no state. This is
  where the business rules live: brand/category data, the `estimateValue()`
  valuation engine (prestige multiplier × condition multiplier × purchase
  price, rounded, producing a cash range and a competition ceiling), and
  `entryPricing()` (the 50%-processing-fee-inclusive-of-VAT math: a player is
  charged `entryFee * 1.5`; net of VAT is `charge / 1.2`; the seller's pot
  gets `entryFee`, the remainder is kept). Changing the pricing or valuation
  model happens here.

- **`src/lib/store.ts`** — the single source of app state, following a
  manual pub/sub pattern (`useSyncExternalStore`, no external state library).
  A module-level `state` object holds `{ wallet, records }`; every mutation
  goes through the `more4me` actions object (`acceptCash`, `startCompetition`,
  `enter`, `recordScore`, `acceptCurrentRaise`, `takePartnerOffer`, `relist`,
  `returnItem`, `previewDeadline`, `topUp`), each of which calls the internal
  `set()` to update state, persist to `localStorage`, and notify subscribers.
  Components read state via the `useMore4Me()` hook. A `setInterval` (plus a
  check on every `useMore4Me()` call) sweeps for competitions whose deadline
  has passed and settles them.

`SellRecord` is a discriminated union (`CashDeal | CompetitionListing`,
tagged by `kind`) — check `kind` before narrowing.

### Competition lifecycle

A `CompetitionListing` moves through `status`:
`authenticating` → `live` → (`closed` if it hits its minimum by the deadline,
or reaches `targetMax` early — checked in `enter()`) or `awaiting_decision`
(deadline passed, minimum missed) → seller then chooses one of
`partner_settled` / `returned` / back to `live` via `relist`.

The winner is never a random draw: `recordScore()` (called from
`SkillGame`'s `onComplete`) updates a per-listing `leaderboard`, and whoever
tops it when the listing closes wins. `isHouseStock: true` listings (the
seeded starter competitions) are excluded from "My listings" in
`MyAccount.tsx` — they represent inventory More4Me already owns, not the
signed-in player's own sales.

`previewDeadline()` is a demo-only affordance (surfaced as a button in
`MyAccount.tsx`) that force-settles a live listing immediately, since there's
no real clock to wait out days of a competition in testing.
