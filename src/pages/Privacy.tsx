const SECTIONS: { title: string; body: string }[] = [
  {
    title: "What we collect",
    body: "Account details (name, email, order and entry history), listing details for watches you sell (brand, model, reference, photos, purchase price), and payment or payout details you add to your account.",
  },
  {
    title: "How we use it",
    body: "To run the marketplace: valuing and authenticating listings, processing entries and payouts, and contacting you about your listings. We don't sell your data to third parties.",
  },
  {
    title: "Who we share it with",
    body: "Our partner watch specialist, for authentication and certification of any watch you ship in. Payment processors, to handle entries, cash offers and payouts. We share the minimum needed for each to do its job.",
  },
  {
    title: "Cookies",
    body: "We use essential cookies and local storage to keep you signed in and remember your basket and listings. We don't use third-party advertising trackers.",
  },
  {
    title: "Your rights",
    body: "You can request a copy of your data, ask us to correct it, or ask us to delete your account, by contacting us. We'll respond within 30 days.",
  },
  {
    title: "Contact",
    body: "Questions about this policy can be sent to hello@rarezy.co.uk.",
  },
];

export function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">Privacy policy</h1>
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
