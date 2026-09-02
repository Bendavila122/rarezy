import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Compass, HelpCircle, Info, Menu, Plus, ShoppingBag, Ticket, User, X } from "lucide-react";
import { useRarezy } from "@/lib/store";
import { authGate } from "@/lib/authGate";
import { tourState } from "@/lib/tourState";

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

const MENU_LINKS = [
  {
    to: "/sell",
    label: "Sell",
    Icon: Plus,
    end: false,
    gateReason: "Create a free account to sell a watch.",
    highlight: true,
  },
  { to: "/help", label: "Help", Icon: HelpCircle, end: false },
  { to: "/account", label: "Account", Icon: User, end: false, gateReason: "Create a free account to continue." },
] as const;

export function NavBar() {
  const { basket, records, currentUser } = useRarezy();
  const [menuOpen, setMenuOpen] = useState(false);
  const basketCount = basket.reduce((sum, b) => sum + b.qty, 0);
  const playableCount = records.filter(
    (r) => r.kind === "competition" && r.attemptsRemaining > 0,
  ).length;

  const badgeFor = (to: string) => {
    if (to === "/entries") return playableCount;
    if (to === "/basket") return basketCount;
    return 0;
  };

  const handleGatedClick = (item: object) => (e: React.MouseEvent) => {
    if ("gateReason" in item && item.gateReason && !currentUser) {
      e.preventDefault();
      authGate.request(item.gateReason as string);
      return;
    }
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NavLink to="/" className="flex h-9 items-center">
          <img src="/rarezy-icon.png" alt="Rarezy" className="h-9 w-auto sm:hidden" />
          <img src="/rarezy-logo-dark.png" alt="Rarezy" className="hidden h-9 w-auto sm:block" />
        </NavLink>

        <div className="flex h-9 items-center gap-3">
          <nav className="flex h-9 items-center gap-5">
            <button
              type="button"
              onClick={() => tourState.open()}
              className="group press relative flex h-9 items-center gap-1.5 border border-white/15 bg-white px-3 text-[0.92rem] font-semibold tracking-tight text-black transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-white/90"
            >
              <span className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
              <Info className="h-4 w-4 transition-transform duration-200 ease-out group-hover:scale-110" strokeWidth={1.9} />
              About
            </button>
            {PRIMARY_LINKS.map((item) => {
              const badge = badgeFor(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={handleGatedClick(item)}
                  className={({ isActive }) =>
                    `group relative flex h-9 items-center gap-1.5 text-[0.92rem] font-semibold tracking-tight transition-all duration-200 ease-out hover:-translate-y-[1px] hover:text-mint ${
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
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="press relative flex h-9 w-9 items-center justify-center bg-white text-black"
          >
            {menuOpen ? <X className="h-4 w-4" strokeWidth={2.2} /> : <Menu className="h-4 w-4" strokeWidth={2.2} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
          <div className="glass-dark absolute right-6 top-full z-30 mt-2 w-56 rounded-none p-2">
            {MENU_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={handleGatedClick(item)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 text-[0.84rem] font-medium tracking-tight transition-all duration-200 ease-out ${
                    "highlight" in item && item.highlight
                      ? isActive
                        ? "bg-mint/20 text-mint"
                        : "bg-mint/10 text-mint hover:bg-mint/15"
                      : isActive
                        ? "text-mint"
                        : "text-white/80 hover:translate-x-0.5 hover:text-mint"
                  }`
                }
              >
                <item.Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.9} />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </>
      )}
    </header>
  );
}
