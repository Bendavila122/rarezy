import { NavLink } from "react-router-dom";
import { Building2, Compass, LogOut, Plus, ShieldCheck, ShoppingBag, Store, Ticket, User } from "lucide-react";
import { useRarezy } from "@/lib/store";
import { auth } from "@/lib/auth";

const PRIMARY_LINKS = [
  { to: "/browse", label: "Browse", Icon: Compass, end: false },
  { to: "/basket", label: "Basket", Icon: ShoppingBag, end: false },
  { to: "/entries", label: "Entries", Icon: Ticket, end: false },
] as const;

const SELL_LINK = { to: "/sell", label: "Sell", Icon: Plus, end: false } as const;

const linkCls = (isActive: boolean) =>
  `group flex h-9 items-center gap-1.5 px-3 text-[0.92rem] font-semibold tracking-tight transition-colors duration-200 ease-out hover:text-mint ${
    isActive ? "text-mint" : "text-white/65"
  }`;

/**
 * The admin account gets its own header entirely — no search, no basket,
 * no browse/sell links, nothing that implies it's a shopper account. Kept
 * as a separate component rather than branches threaded through the
 * regular nav below, so there's no path where admin-only markup and
 * shopper-only markup share a render tree.
 */
function AdminNavBar() {
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2 text-white/85">
          <ShieldCheck className="h-5 w-5 text-mint" strokeWidth={1.9} />
          <span className="text-[0.95rem] font-semibold tracking-tight">Rarezy Admin</span>
        </div>
        <button
          type="button"
          onClick={() => auth.signOut()}
          className="press flex h-9 items-center gap-1.5 px-3 text-[0.85rem] font-medium tracking-tight text-white/65 hover:text-mint"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.9} />
          Log out
        </button>
      </div>
    </header>
  );
}

/**
 * A verified business seller gets its own header too — no search, basket,
 * browse or entries, nothing implying they're shopping. Kept as a fully
 * separate component for the same reason as `AdminNavBar`: no render tree
 * where shopper-only and seller-only markup share branches.
 */
function SellerNavBar() {
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NavLink to="/seller" className="flex items-center gap-2 text-white/85">
          <Store className="h-5 w-5 text-mint" strokeWidth={1.9} />
          <span className="text-[0.95rem] font-semibold tracking-tight">Rarezy Seller</span>
        </NavLink>
        <nav className="flex h-9 items-center gap-1">
          <NavLink to="/seller/new" className={({ isActive }) => linkCls(isActive)}>
            <Plus className="h-4 w-4" strokeWidth={1.9} />
            New competition
          </NavLink>
          <button
            type="button"
            onClick={() => auth.signOut()}
            className="press flex h-9 items-center gap-1.5 px-3 text-[0.85rem] font-medium tracking-tight text-white/65 hover:text-mint"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.9} />
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}

/**
 * A guest gets the home page in full, but none of the account-scoped nav —
 * no Browse, Basket, Entries or Sell, since none of those are usable
 * without an account any more. Just the logo and a way in.
 */
function GuestNavBar() {
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <NavLink to="/" className="flex h-9 items-center">
          <img src="/rarezy-icon.png" alt="Rarezy" className="h-9 w-auto sm:hidden" />
          <img src="/rarezy-logo-dark.png" alt="Rarezy" className="hidden h-9 w-auto sm:block" />
        </NavLink>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Below sm:, the full text link doesn't fit next to Log in/Sign up — a
              compact icon (amber, matching the for-business page's own accent so
              it reads as "a different, business side of the site") keeps the
              entry point one tap away without crowding the header. */}
          <NavLink
            to="/for-business"
            aria-label="Rarezy for Businesses"
            className="press flex h-9 w-9 items-center justify-center text-amber-300 sm:hidden"
          >
            <Building2 className="h-4 w-4" strokeWidth={2.2} />
          </NavLink>
          <NavLink
            to="/for-business"
            className="press hidden h-9 items-center px-4 text-[0.85rem] font-medium tracking-tight text-white/75 hover:text-mint sm:flex"
          >
            Rarezy for Businesses
          </NavLink>
          <NavLink
            to="/login"
            className="press flex h-9 items-center px-4 text-[0.85rem] font-medium tracking-tight text-white/75 hover:text-mint"
          >
            Log in
          </NavLink>
          <NavLink
            to="/signup"
            state={{ accountType: "competitor" }}
            className="press flex h-9 items-center rounded-full bg-mint px-4 text-[0.85rem] font-semibold tracking-tight text-brand-deep"
          >
            Sign up
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export function NavBar() {
  const { currentUser } = useRarezy();
  if (currentUser?.isAdmin) return <AdminNavBar />;
  if (currentUser?.isSeller) return <SellerNavBar />;
  if (!currentUser) return <GuestNavBar />;
  return <ShopperNavBar />;
}

function ShopperNavBar() {
  const { basket, records, currentUser } = useRarezy();
  const basketCount = basket.reduce((sum, b) => sum + b.qty, 0);
  const playableCount = records.filter(
    (r) => r.kind === "competition" && r.attemptsRemaining > 0,
  ).length;

  const badgeFor = (to: string) => {
    if (to === "/entries") return playableCount;
    if (to === "/basket") return basketCount;
    return 0;
  };

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-5">
          <NavLink to="/browse" className="flex h-9 items-center">
            <img src="/rarezy-icon.png" alt="Rarezy" className="h-9 w-auto sm:hidden" />
            <img src="/rarezy-logo-dark.png" alt="Rarezy" className="hidden h-9 w-auto sm:block" />
          </NavLink>
        </div>

        <nav className="flex h-9 items-center gap-1">
          {PRIMARY_LINKS.map((item) => {
            const badge = badgeFor(item.to);
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => linkCls(isActive)}>
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
            );
          })}

          <NavLink to={SELL_LINK.to} end={SELL_LINK.end} className={({ isActive }) => linkCls(isActive)}>
            <SELL_LINK.Icon className="h-4 w-4 transition-transform duration-200 ease-out group-hover:scale-110" strokeWidth={1.9} />
            {SELL_LINK.label}
          </NavLink>

          <NavLink
            to="/account"
            aria-label="Account"
            className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-white/60 transition-transform duration-200 ease-out hover:scale-110"
          >
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4" strokeWidth={2} />
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
