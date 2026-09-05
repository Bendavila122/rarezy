import type { Faq } from "./faqs";

/** Dealer-facing FAQ set for the "Rarezy for Businesses" page — separate from the buyer-facing `FAQS` since sellers and buyers now have fully different account experiences and different questions. */
export const BUSINESS_FAQS: Faq[] = [
  {
    q: "What does it cost to list?",
    a: "Nothing. It's completely free to list and free to sell — no listing fee, no commission on what you raise. We add a small processing fee at checkout, which the buyer pays, not you.",
  },
  {
    q: "How does my business get verified?",
    a: "You apply with your business details — name, category, contact info — and our team reviews it, usually within a day or two, before you're approved to list.",
  },
  {
    q: "Do I set my own prices?",
    a: "Yes. You choose the ticket price, how many entries to sell, and the deadline for every competition — Rarezy doesn't set any of that for you.",
  },
  {
    q: "What does the AI Marketing Centre actually generate?",
    a: "Real ad creative and copy from your own product photos — not stock images or AI hallucinations. You get on-brand posts for Instagram, TikTok, email and more, free, from your seller dashboard.",
  },
  {
    q: "How is the winner picked?",
    a: "Whoever tops the leaderboard when the competition closes — there's no random draw. It's the same reason buyers trust the marketplace, which is good for you too.",
  },
  {
    q: "Do I ship the prize myself?",
    a: "Yes. If your competition sells out or hits your minimum by the deadline, you send it straight to the winner yourself — insured, with tracking — and mark it dispatched from your dashboard. Your stock stays with you the entire time; we never take possession of it.",
  },
  {
    q: "What if I don't hit my minimum?",
    a: "You're not obligated to ship anything. If it doesn't reach your minimum by the deadline, the competition's voided and every entry is refunded in full.",
  },
  {
    q: "Who authenticates what I list?",
    a: "You do — this is your own genuine stock, not consumer items we inspect ourselves. That's exactly why the bar is high: list something that turns out to be fake, and it's an instant ban from the platform, every buyer refunded in full, and you're fined the processing fees we missed out on from that sale.",
  },
];
