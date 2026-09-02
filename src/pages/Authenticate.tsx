import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";

export function Authenticate() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <BadgeCheck className="h-8 w-8 text-brand" strokeWidth={1.6} />
      <p className="mt-4 text-[0.62rem] uppercase tracking-[0.24em] text-muted">Verity Authentication</p>
      <h1 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.03em]">Standalone authentication</h1>
      <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
        Not ready to sell? Verity Authentication can authenticate and certify a watch on its own, without putting it
        up for sale. You get an independent certificate of authenticity for insurance, resale, or your own peace of
        mind.
      </p>

      <div className="card mt-8 p-5">
        <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">How it works</p>
        <ol className="mt-3 flex flex-col gap-2.5 text-[0.85rem] leading-relaxed text-foreground">
          <li>1. Ship your watch to Verity Authentication, fully insured in transit.</li>
          <li>2. It's inspected, movement-checked, and matched against known reference data.</li>
          <li>3. You get a certificate and the watch back — list it, keep it, or sell it elsewhere.</li>
        </ol>
        <button
          type="button"
          disabled
          className="mt-5 w-full rounded-none bg-white/[0.05] px-4 py-3 text-[0.82rem] font-medium text-muted"
        >
          Request authentication — coming soon
        </button>
      </div>

      <Link to="/sell" className="mt-4 block text-center text-[0.8rem] text-brand">
        Or list it for sale with Rarezy instead →
      </Link>
    </div>
  );
}
