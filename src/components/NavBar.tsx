import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Compass, Info, Plus, ShoppingBag, Ticket, User } from "lucide-react";
import { motion } from "motion/react";
import { useRarezy } from "@/lib/store";
import { authGate } from "@/lib/authGate";
import { tourState } from "@/lib/tourState";
import { TourHintBubble } from "@/components/TourHintBubble";

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

/** Glass pill that slides between whichever tab is currently hovered — shared layoutId means Motion animates its position/size across sibling wrappers automatically. */
function TabGlass() {
  return (
    <motion.span
      layoutId="navTabGlass"
      className="absolute inset-0 bg-white/10"
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

  const badgeFor = (to: string) => {
    if (to === "/entries") return playableCount;
    if (to === "/basket") return basketCount;
    return 0;
  };

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

        <nav
          className="glass-dark relative flex h-11 items-center gap-1 px-1.5"
          onMouseLeave={() => setHovered(null)}
        >
          <div className="relative" onMouseEnter={() => setHovered("about")}>
            {hovered === "about" && <TabGlass />}
            <button
              type="button"
              onClick={() => tourState.open()}
              className="group press relative z-10 flex h-9 items-center gap-1.5 border border-white/15 bg-white px-3 text-[0.92rem] font-semibold tracking-tight text-black transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-white/90"
            >
              <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
              <Info className="h-4 w-4 transition-transform duration-200 ease-out group-hover:scale-110" strokeWidth={1.9} />
              About
            </button>
            <TourHintBubble />
          </div>

          {PRIMARY_LINKS.map((item) => {
            const badge = badgeFor(item.to);
            return (
              <div key={item.to} className="relative" onMouseEnter={() => setHovered(item.to)}>
                {hovered === item.to && <TabGlass />}
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={handleGatedClick(item)}
                  className={({ isActive }) =>
                    `group relative z-10 flex h-9 items-center gap-1.5 px-3 text-[0.92rem] font-semibold tracking-tight transition-all duration-200 ease-out hover:text-mint ${
                      isActive ? "text-mint" : "text-white/65"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
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
                      {isActive && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-none bg-mint" />}
                    </>
                  )}
                </NavLink>
              </div>
            );
          })}

          <div className="relative" onMouseEnter={() => setHovered("sell")}>
            {hovered === "sell" && <TabGlass />}
            <NavLink
              to={SELL_LINK.to}
              end={SELL_LINK.end}
              onClick={handleGatedClick(SELL_LINK)}
              className={({ isActive }) =>
                `press relative z-10 flex h-9 items-center gap-1.5 bg-mint px-4 text-[0.88rem] font-bold tracking-tight text-brand-deep transition-all duration-200 ease-out hover:bg-mint/90 ${
                  isActive ? "ring-2 ring-white/50" : ""
                }`
              }
            >
              <SELL_LINK.Icon className="h-4 w-4" strokeWidth={2.2} />
              {SELL_LINK.label}
            </NavLink>
          </div>

          <div className="relative" onMouseEnter={() => setHovered("account")}>
            {hovered === "account" && <TabGlass />}
            <NavLink
              to="/account"
              onClick={handleGatedClick({ to: "/account", gateReason: ACCOUNT_GATE_REASON })}
              aria-label="Account"
              className="press relative z-10 flex h-9 w-9 shrink-0 items-center justify-center bg-mint text-[0.85rem] font-bold text-brand-deep"
            >
              {currentUser ? (
                currentUser.username.charAt(0).toUpperCase()
              ) : (
                <User className="h-4 w-4" strokeWidth={2} />
              )}
            </NavLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
