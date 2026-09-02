export type Faq = { q: string; a: string };

/** Shared across the Help centre page and the home page's FAQ section — one source of truth. */
export const FAQS: Faq[] = [
  {
    q: "Is this gambling?",
    a: "No. Every entrant plays the same tile-merging match — sliding and combining watch-brand tiles up the ladder — and the winner is whoever scores highest before the deadline. There's no random draw. A ticket buys you a chance to compete, not a chance to win by luck.",
  },
  {
    q: "How is my watch authenticated?",
    a: "Once it arrives, our partner watch specialist checks it against stolen-item registers, verifies the movement and papers, services it if needed, then certifies and photographs it. You'll see the certificate ID on your listing.",
  },
  {
    q: "What does a ticket actually cost?",
    a: "The ticket price shown on a listing is what goes toward the seller's price. At checkout, a 50% processing fee is added on top — it covers VAT and Rarezy's fee. A £2 ticket becomes a £3 charge, with £2 of that reaching the seller's pot.",
  },
  {
    q: "What if a listing doesn't reach the seller's minimum?",
    a: "The seller decides what happens next: accept whatever was raised, take a first-refusal cash offer from our partner watch specialist, relist with a fresh deadline, or have the watch shipped back to them.",
  },
  {
    q: "Who pays for shipping and insurance?",
    a: "We do. Shipping is free both ways, and every watch is held fully insured in a safe deposit from the moment it's authenticated until a winner is decided.",
  },
  {
    q: "How fast is the instant cash offer paid?",
    a: "Within 48 hours of you accepting it, paid straight to your linked payout account.",
  },
];
