# More4Me

Sell a luxury item for an instant cash offer, or enter it into a skill-based
competition — players compete in a short game, and the leaderboard (not a
random draw) decides who wins the item.

A standalone demo: no backend, no real payments. State (wallet balance and
listings) persists to `localStorage` so a refresh doesn't lose progress.

## Running it

```bash
npm install
npm run dev
```

Opens at `http://127.0.0.1:5173` (or whatever port Vite prints).

## How it works

- **`/sell`** — describe an item (category, brand, condition, year, price
  paid) and get an instant cash offer range plus a competition ceiling.
  Accept the cash offer, or ship the item in for free authentication and
  list it as a competition: you set the entry price, the minimum you'll
  accept, and the deadline.
- **`/browse`** — live competitions, filterable by category. Entries sold
  and days left are visible; the seller's minimum isn't.
- **`/item/:id`** — buy entries (50% processing fee, VAT-inclusive) and play
  the skill game once per entry. The leaderboard tracks your best score.
- **`/account`** — your wallet (top up with demo funds), your cash deals,
  and your competition listings. If a competition closes under its
  minimum, choose to accept the raised amount, take a partner-jeweller cash
  offer, relist, or have the item returned (entrants refunded, the
  processing fee isn't).

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, React Router, Motion.
