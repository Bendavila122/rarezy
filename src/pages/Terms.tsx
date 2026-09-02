const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. What Rarezy is",
    body: "Rarezy is a marketplace for luxury watches. A seller ships a watch in for authentication, then either accepts an instant cash offer or lists it with a ticket price. Entrants play a real tile-merging match — sliding and combining matching watch-brand tiles to double their value up the ladder; whoever has the top score when the deadline is reached wins the watch.",
  },
  {
    title: "2. Listings, photos and descriptions",
    body: "Every watch is checked against stolen-item registers, verified for authenticity and condition, professionally photographed and given a full written description by our partner watch specialist before it's listed or bought back. The condition and estimate a seller provides at listing is not final until this check is complete.",
  },
  {
    title: "3. Tickets and fees",
    body: "The ticket price shown on a listing is the amount that counts toward the seller's price. At checkout, a 50% processing fee is added on top of that ticket price — the total covers VAT and Rarezy's fee. Tickets are non-refundable once purchased, except where a listing is withdrawn before its deadline.",
  },
  {
    title: "4. Listings and winners",
    body: "Winners are determined solely by skill-game score — there is no random draw. If a listing reaches its funding ceiling before the deadline, it closes early and the leaderboard at that moment stands. If the minimum reserve isn't reached by the deadline, the seller chooses whether to accept the amount raised, take a cash offer, relist, or have the watch returned.",
  },
  {
    title: "5. Cash offers",
    body: "An accepted instant cash offer is final and paid to your linked payout account within 48 hours, subject to standard verification.",
  },
  {
    title: "6. Shipping and insurance",
    body: "Rarezy covers shipping both ways for authentication. Once a watch is authenticated, it's held in insured safe deposit until a winner is decided, a cash offer is accepted, or it's returned to the seller.",
  },
  {
    title: "7. Liability",
    body: "Rarezy is not liable for market fluctuations in a watch's value between listing and sale. Valuations and estimates are indicative, not guaranteed.",
  },
  {
    title: "8. Changes to these terms",
    body: "We may update these terms from time to time. Continued use of Rarezy after a change means you accept the updated terms.",
  },
];

export function Terms() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">Terms of service</h1>
      <p className="mt-3 text-[0.78rem] text-muted/70">Last updated 1 September 2026</p>

      <div className="mt-8 flex flex-col gap-7">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <p className="text-[0.9rem] font-medium tracking-tight">{s.title}</p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
