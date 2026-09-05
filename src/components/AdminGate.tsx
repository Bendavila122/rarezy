import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRarezy } from "@/lib/store";

/**
 * The admin account is operational only — it has no business browsing,
 * buying, selling or holding a normal account, so it's kept off every page
 * except the dashboard itself. Anywhere else redirects straight back to
 * /admin. This is a UX boundary, not the security boundary — that's
 * enforced server-side (see the `protect_is_admin` trigger); this just keeps
 * the one legitimate admin account from wandering into shopper UI that was
 * never designed for it.
 */
export function AdminGate() {
  const { currentUser } = useRarezy();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.isAdmin) return;
    if (pathname === "/admin") return;
    navigate("/admin", { replace: true });
  }, [currentUser?.isAdmin, pathname, navigate]);

  return null;
}
