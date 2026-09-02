import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Compass, Plus, ShoppingBag, Ticket, User } from "lucide-react";
import { motion } from "motion/react";
import { useRarezy } from "@/lib/store";
import { authGate } from "@/lib/authGate";

const PRIMARY_LINKS = [
  { to: "/browse", label: "Browse", Icon: Compass, end: false },
  { to: "/basket", label: "Basket", Icon: ShoppingBag, end: false },
  {
    to: "/entries",
    label: "Entries",
    Icon: Ticket,
    end: false,
    gateReason: "Create a free account to see your entries.",
  },
] as const;

const SELL_LINK = {
  to: "/sell",
  label: "Sell",
  Icon: Plus,
  end: false,
  gateReason: "Create a free account to sell a watch.",
} as const;

const ACCOUNT_GATE_REASON = "Create a free account to continue.";

const linkCls = (isActive: boolean) =>
  `group relative z-10 flex h-9 items-center gap-1.5 px-3 text-[0.92rem] font-semibold tracking-tight transition-colors duration-200 ease-out hover:text-mint ${
    isActive ? "text-mint" : "text-white/65"
  }`;

/** Glass pill that slides between whichever tab is currently hovered — shared layoutId means Motion animates its position/size across sibling wrappers automatically. A real `.glass-dark` pane (blur + saturation + inner highlight), not a flat tint, so it reads as an obvious floating piece of glass. */
function TabGlass() {
  return (
    <motion.span
      layoutId="navTabGlass"
      className="glass-block absolute inset-0"
      transition={{ type: "spring", bounce: 0.25, duration: 0.45 }}
    />
  );
}

export function NavBar() {
  const { basket, records, currentUser } = useRarezy();
  const basketCount = basket.reduce((sum, b) => sum + b.qty, 0);
  const playableCount = records.filter(
    (r) => r.kind === "competition" && r.attemptsRemaining > 0,
  ).length;
  const [hovered, setHovered] = useState<string | null>(null);
  const { pathname } = useLocation();

  const badgeFor = (to: string) => {
    if (to === "/entries") return playableCount;
    if (to === "/basket") return basketCount;
    return 0;
  };

  const isPathActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const activeKey = [...PRIMARY_LINKS, SELL_LINK].find((item) => isPathActive(item.to))?.to ?? null;
  const highlightKey = hovered ?? activeKey;

  const handleGatedClick = (item: object) => (e: React.MouseEvent) => {
    if ("gateReason" in item && item.gateReason && !currentUser) {
      e.preventDefault();
      authGate.request(item.gateReason as string);
    }
  };

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NavLink to="/" className="flex h-9 items-center">
          <img src="/rarezy-icon.png" alt="Rarezy" className="h-9 w-auto sm:hidden" />
          <img src="/rarezy-logo-dark.png" alt="Rarezy" className="hidden h-9 w-auto sm:block" />
        </NavLink>

        <nav className="flex h-9 items-center gap-1" onMouseLeave={() => setHovered(null)}>
          {PRIMARY_LINKS.map((item) => {
            const badge = badgeFor(item.to);
            return (
              <div key={item.to} className="relative" onMouseEnter={() => setHovered(item.to)}>
                {highlightKey === item.to && <TabGlass />}
                <NavLink to={item.to} end={item.end} onClick={handleGatedClick(item)} className={({ isActive }) => linkCls(isActive)}>
                  <item.Icon
                    className="h-4 w-4 transition-transform duration-200 ease-out group-hover:scale-110"
                    strokeWidth={1.9}
                  />
                  {item.label}
                  {badge > 0 && (
                    <span className="tabular flex h-4 min-w-4 items-center justify-center rounded-none bg-mint px-1 text-[0.58rem] font-medium text-brand-deep">
                      {badge}
                    </span>
                  )}
                </NavLink>
              </div>
            );
          })}

          <div className="relative" onMouseEnter={() => setHovered(SELL_LINK.to)}>
            {highlightKey === SELL_LINK.to && <TabGlass />}
            <NavLink to={SELL_LINK.to} end={SELL_LINK.end} onClick={handleGatedClick(SELL_LINK)} className={({ isActive }) => linkCls(isActive)}>
              <SELL_LINK.Icon className="h-4 w-4 transition-transform duration-200 ease-out group-hover:scale-110" strokeWidth={1.9} />
              {SELL_LINK.label}
            </NavLink>
          </div>

          <div className="relative" onMouseEnter={() => setHovered(null)}>
            <NavLink
              to="/account"
              onClick={handleGatedClick({ to: "/account", gateReason: ACCOUNT_GATE_REASON })}
              aria-label="Account"
              className="relative z-10 ml-1 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-white/60 transition-transform duration-200 ease-out hover:scale-110"
            >
              <User className="h-4 w-4" strokeWidth={2} />
            </NavLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
