import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRarezy } from "@/lib/store";

/**
 * A verified business seller account is operational only — no browsing,
 * basket, entries or home page, just their dashboard and whatever hangs
 * off `/seller`. Anywhere else redirects straight back to `/seller`, the
 * same UX-boundary pattern as `AdminGate` (the real security boundary is
 * Supabase RLS, not this). Admin takes priority in `NavBar`/here since the
 * one admin account is never also a business seller in practice.
 */
export function SellerGate() {
  const { currentUser } = useRarezy();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.isSeller || currentUser?.isAdmin) return;
    if (pathname.startsWith("/seller")) return;
    navigate("/seller", { replace: true });
  }, [currentUser?.isSeller, currentUser?.isAdmin, pathname, navigate]);

  return null;
}
