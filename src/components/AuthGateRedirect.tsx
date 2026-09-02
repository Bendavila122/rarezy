import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authGate, useAuthGate } from "@/lib/authGate";

/**
 * The single gate every buy/sell/account action passes through. It never
 * blocks browsing — `authGate.request(reason)` just sends a guest to the
 * standalone signup page, carrying the reason and where to return to once
 * they're in. Replaces the old inline username popup now that account
 * creation is a real, multi-step flow.
 */
export function AuthGateRedirect() {
  const { open, reason } = useAuthGate();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    navigate("/signup", { state: { reason, next: location.pathname } });
    authGate.dismiss();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return null;
}
