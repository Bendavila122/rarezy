import { Link, useLocation } from "react-router-dom";
import { Star } from "lucide-react";

const headingCls = "text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/40";

/**
 * This footer only ever renders for a signed-out guest (see App.tsx) —
 * player accounts are app-like and nav-driven, with no footer at all, and
 * admin/seller get their own header entirely. So every link here has to
 * actually work without an account: Browse and Sell both sit behind a
 * sign-up wall, so they're deliberately left out.
 */
const QUICK_LINKS = [
  { label: "Rarezy for Businesses", to: "/for-business" },
  { label: "How it works", to: "/how-it-works" },
  { label: "Help centre", to: "/help" },
];

const COMPANY_LINKS = [
  { label: "Contact", to: "/contact" },
  { label: "Terms of service", to: "/terms" },
  { label: "Privacy policy", to: "/privacy" },
];

/** Flat monochrome marks (simple-icons) rather than the official multicolour logos — a colour-inverted official Amex/Mastercard lockup turns into an unreadable solid block at this size, these read cleanly as plain white icons on a dark footer. */
const PAYMENT_METHODS = [
  { name: "Visa", logo: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/visa.svg" },
  { name: "Mastercard", logo: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/mastercard.svg" },
  { name: "American Express", logo: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/americanexpress.svg" },
  { name: "Apple Pay", logo: "https://cdn.jsdelivr.net/npm/simple-icons@16.29.0/icons/applepay.svg" },
  { name: "Stripe", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Stripe_logo%2C_revised_2014.png" },
];

export function Footer() {
  const { pathname } = useLocation();
  // The home page's sections already end with their own bottom padding — no extra gap needed there.
  const marginCls = pathname === "/" ? "" : "mt-24";

  return (
    // `relative z-10`: the home page renders a `position: fixed` background behind its
    // sections (see Home.tsx) — without its own stacking context, this footer (being
    // plain `position: static`) would paint underneath that fixed layer and disappear.
    // No background colour of its own — it sits directly on whatever's behind it (the
    // fixed mesh on the home page, the plain page background elsewhere) rather than
    // reading as its own separate block.
    <footer className={`relative z-10 ${marginCls} border-t border-white/[0.08] text-white`}>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-6 py-14 text-center sm:grid-cols-4 sm:text-left">
        {/* Brand */}
        <div className="col-span-2 flex flex-col items-center sm:items-start">
          <img src="/rarezy-logo-dark.png" alt="Rarezy" className="h-9 w-auto" />
          <p className="mt-4 max-w-[16rem] text-[0.8rem] leading-relaxed text-white/55">
            The UK marketplace for luxury items — authenticated, insured, and won on skill.
          </p>
          <div className="glass-dark mt-5 inline-flex items-center gap-1.5 rounded-none px-2.5 py-1">
            {/* Placeholder rating/count standing in for a real Trustpilot embed once the business has an account to pull live data from. */}
            <div className="flex items-center gap-[1px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-2.5 w-2.5 fill-mint text-mint" strokeWidth={0} />
              ))}
            </div>
            <p className="text-[0.62rem] text-white/60">
              <span className="font-bold text-white">4.8</span> · Trustpilot
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <Link
              to="/login"
              className="press rounded-full border border-white/15 px-4 py-2 text-[0.8rem] font-medium tracking-tight text-white/85 hover:border-white/30"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              state={{ accountType: "competitor" }}
              className="press rounded-full bg-mint px-4 py-2 text-[0.8rem] font-semibold tracking-tight text-brand-deep"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Quick links — only ever pages that actually work without an account */}
        <div className="flex flex-col items-center gap-3.5 sm:items-start">
          <p className={headingCls}>Quick links</p>
          {QUICK_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-[0.82rem] tracking-tight text-white/75 hover:text-mint">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Company + contact */}
        <div className="flex flex-col items-center gap-3.5 sm:items-start">
          <p className={headingCls}>Company</p>
          {COMPANY_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-[0.82rem] tracking-tight text-white/75 hover:text-mint">
              {l.label}
            </Link>
          ))}
          <a href="mailto:help@rarezy.co.uk" className="mt-1.5 text-[0.78rem] font-medium text-mint hover:underline">
            help@rarezy.co.uk
          </a>
          <a
            href="tel:+442079460958"
            className="text-[0.78rem] font-medium text-white/55 hover:text-mint hover:underline"
          >
            020 7946 0958
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-4 border-t border-white/[0.06] px-6 py-6 sm:flex-row sm:justify-between">
        <p className="text-[0.68rem] text-white/45">
          © {new Date().getFullYear()} Rarezy Ltd. Registered in England &amp; Wales.
        </p>
        <div className="flex items-center gap-4">
          {PAYMENT_METHODS.map((m) => (
            <img
              key={m.name}
              src={m.logo}
              alt={m.name}
              className="h-4 w-auto object-contain opacity-60 brightness-0 invert transition-opacity hover:opacity-90"
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
