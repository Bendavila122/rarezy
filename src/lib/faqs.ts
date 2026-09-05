export type Faq = { q: string; a: string };

/** Shared across the Help centre page and the home page's FAQ section — one source of truth. */
export const FAQS: Faq[] = [
  {
    q: "Is this gambling?",
    a: "No. Every entrant plays the same skill game for a given competition, and the winner is whoever scores highest before the deadline. There's no random draw. A ticket buys you a chance to compete, not a chance to win by luck.",
  },
  {
    q: "How is an item authenticated?",
    a: "Depends on how it got here. If you sold us your own watch for cash, our specialists physically checked it before paying you. Competition items are a seller's own verified stock — if one ever turns out to be fake, that seller is banned instantly and every buyer is refunded in full.",
  },
  {
    q: "What does a ticket actually cost?",
    a: "The ticket price shown is what goes to the seller in full. At checkout, we add a processing fee on top — 30% plus a flat 20p — which is how Rarezy makes money. A £2 ticket comes to £2.80 at checkout.",
  },
  {
    q: "Who pays for shipping and insurance on a prize?",
    a: "The seller does. Once a competition's won, they ship your prize straight to you — insured and tracked, at no cost to you.",
  },
  {
    q: "How fast is an instant cash offer paid?",
    a: "On the spot. Once our specialist inspects your item in person at your visit, you're paid there and then — no waiting around afterwards.",
  },
  {
    q: "How is the winner decided?",
    a: "Whoever has the top score on the leaderboard when the competition closes wins — ties go to whoever set that score first. Nothing is drawn or chosen.",
  },
  {
    q: "What happens if a competition doesn't sell all its tickets?",
    a: "It can still resolve — every seller sets a minimum, and once that's reached by the deadline, the top scorer wins regardless of how many tickets sold. If it doesn't reach that minimum, the competition's cancelled and every ticket bought is refunded.",
  },
  {
    q: "How many goes do I get at the game per ticket?",
    a: "One. Each ticket buys exactly one attempt, so buying more tickets for the same competition gets you more attempts and more shots at the top score.",
  },
  {
    q: "Do I need to verify my identity to enter?",
    a: "Yes — a quick photo ID and proof-of-address check is part of signing up, in line with UK requirements for prize competitions like this one.",
  },
  {
    q: "I run a business — can I list my own stock?",
    a: "Yes. Rarezy for Businesses is our dealer side — apply, get verified, and list your own competitions with your own ticket price, entry count and deadline.",
  },
];
