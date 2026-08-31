import { NavLink } from "react-router-dom";
import { Trophy, Wallet } from "lucide-react";
import { money } from "@/lib/marketplace";
import { useMore4Me } from "@/lib/store";

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `text-[0.82rem] tracking-tight transition-colors ${isActive ? "text-gold" : "text-muted hover:text-foreground"}`;

export function NavBar() {
  const { wallet } = useMore4Me();

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <Trophy className="h-[1.1rem] w-[1.1rem] text-gold" strokeWidth={1.8} />
          <span className="text-[0.95rem] font-semibold tracking-tight">More4Me</span>
        </NavLink>

        <nav className="flex items-center gap-6">
          <NavLink to="/browse" className={linkCls}>
            Browse
          </NavLink>
          <NavLink to="/sell" className={linkCls}>
            Sell
          </NavLink>
          <NavLink to="/account" className="flex items-center gap-1.5 text-[0.82rem] text-muted">
            <Wallet className="h-[0.9rem] w-[0.9rem]" strokeWidth={1.8} />
            <span className="tabular text-foreground">{money(wallet.balance)}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
