import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ShieldCheck, Trophy, Watch } from "lucide-react";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

export function About() {
  const { hash } = useLocation();

  // React Router doesn't scroll to hash fragments on its own — used when a
  // watch's "Authenticated" badge links here as `/about#authenticated`.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <p className={labelCls}>About</p>
      <h1 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">
        A better way to sell a watch you've outgrown.
      </h1>
      <p className="mt-5 max-w-lg text-[0.9rem] leading-relaxed text-muted">
        Selling a luxury watch usually means one trade-off: a quick sale at a discount, or a slow
        one hoping to find the right buyer. Rarezy is built around a third option — list it with
        a ticket price, professionally photographed and fully described, and let genuine demand set
        the price, while a cash offer stays on the table the whole time.
      </p>
      <p className="mt-4 max-w-lg text-[0.9rem] leading-relaxed text-muted">
        We're starting with luxury watches, and only luxury watches — Rolex, Patek Philippe,
        Audemars Piguet and the rest of the brands people actually queue for. Getting authentication,
        insurance and payouts right for one category first, rather than half-right for many.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { Icon: Watch, title: "Watches only", body: "One category, done properly, before we consider another." },
          { Icon: ShieldCheck, title: "Authenticated", body: "Every watch checked, certified and insured before it's listed." },
          { Icon: Trophy, title: "Won on skill", body: "No random draws — the leaderboard decides who wins." },
        ].map(({ Icon, title, body }) => (
          <div
            key={title}
            id={title === "Authenticated" ? "authenticated" : undefined}
            className="card scroll-mt-24 p-5"
          >
            <Icon className="h-5 w-5 text-brand" strokeWidth={1.7} />
            <p className="mt-3 text-[0.9rem] font-medium tracking-tight">{title}</p>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
