import { Link, useLocation } from "react-router-dom";
import { Star } from "lucide-react";

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse watches", to: "/browse" },
      { label: "Sell your watch", to: "/sell" },
      { label: "How it works", to: "/how-it-works" },
      { label: "Partner services", to: "/partners" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My account", to: "/account" },
      { label: "My entries", to: "/entries" },
      { label: "Payments", to: "/payments" },
      { label: "Help centre", to: "/help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Terms of service", to: "/terms" },
      { label: "Privacy policy", to: "/privacy" },
    ],
  },
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
    <footer className={`relative z-10 ${marginCls} text-white`}>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <img src="/rarezy-logo-dark.png" alt="Rarezy" className="h-9 w-auto" />

          {/* Placeholder rating/count standing in for a real Trustpilot embed once the business has an account to pull live data from. */}
          <div className="glass-dark mt-4 inline-flex items-center gap-1.5 rounded-none px-2.5 py-1">
            <div className="flex items-center gap-[1px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-2.5 w-2.5 fill-mint text-mint" strokeWidth={0} />
              ))}
            </div>
            <p className="text-[0.62rem] text-white/60">
              <span className="font-bold text-white">4.8</span> · Trustpilot
            </p>
          </div>

          <p className="mt-4 max-w-[15rem] text-[0.75rem] leading-relaxed text-white/55">
            The UK marketplace for luxury items — authenticated, insured, and won on skill.
          </p>
          <a
            href="mailto:help@rarezy.app"
            className="mt-4 inline-block text-[0.78rem] font-medium text-mint hover:underline"
          >
            help@rarezy.app
          </a>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/40">{col.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[0.82rem] tracking-tight text-white/75 hover:text-mint">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col-reverse items-center gap-4 px-6 py-6 sm:flex-row sm:justify-between">
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
