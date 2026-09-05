import { Link } from "react-router-dom";
import { Banknote, ClipboardCheck, ShieldCheck, Truck } from "lucide-react";

const STEPS = [
  {
    Icon: ClipboardCheck,
    title: "1. Tell us about it",
    body: "Brand, model, reference, condition and what you paid — with photos, if you have them. Takes a couple of minutes.",
  },
  {
    Icon: ShieldCheck,
    title: "2. We review it",
    body: "Your details and photos get checked against market data and our authenticity checklist before any offer is made.",
  },
  {
    Icon: Banknote,
    title: "3. Get a real cash offer",
    body: "A firm cash offer lands in your account. No obligation — accept it, or decline and keep the watch.",
  },
  {
    Icon: Truck,
    title: "4. Get paid in person",
    body: "A Rarezy specialist visits you, inspects it in person, and pays out on the spot the moment it's confirmed.",
  },
];

export function HowItWorks() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">How selling to Rarezy works</h1>
      <p className="mt-3 max-w-lg text-[0.9rem] leading-relaxed text-muted">
        A straightforward instant cash sale for your watch — no auctions, no waiting on a buyer,
        no listing it yourself. Tell us about it, get an offer, get paid in person.
      </p>

      <div className="mt-10 flex flex-col gap-4">
        {STEPS.map(({ Icon, title, body }) => (
          <div key={title} className="card flex gap-4 p-5">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={1.7} />
            <div>
              <p className="text-[0.9rem] font-medium tracking-tight">{title}</p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <p className="text-[0.85rem] leading-relaxed text-muted">
          Run a business and want to list your own stock as a ticketed competition instead?
          That's a separate, verified-seller route —{" "}
          <Link to="/for-business" className="text-brand underline underline-offset-4">
            see Rarezy for Businesses
          </Link>
          .
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/sell"
          className="rounded-none bg-brand px-6 py-3.5 text-[0.9rem] font-medium tracking-tight text-background transition-transform active:scale-[0.97]"
        >
          Sell your watch
        </Link>
        <Link
          to="/help"
          className="rounded-none border border-white/12 px-6 py-3.5 text-[0.9rem] font-medium tracking-tight transition-transform active:scale-[0.97]"
        >
          Read the FAQ
        </Link>
      </div>
    </div>
  );
}
