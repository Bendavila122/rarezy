import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const KEY = "rarezy.cookie-consent";

/** Shown once per browser on first visit; persists the choice so it never nags again. */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let accepted = true;
    try {
      accepted = Boolean(localStorage.getItem(KEY));
    } catch {
      /* private browsing — just don't show it if we can't remember the choice */
    }
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(KEY, "accepted");
    } catch {
      /* private browsing */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[200] px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="glass-dark mx-auto flex max-w-3xl flex-col items-start gap-4 border border-white/15 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.82rem] leading-relaxed text-white/70">
          We use cookies to keep Rarezy running smoothly and to understand how it's used. By continuing, you agree
          to our{" "}
          <Link to="/privacy" className="text-mint underline underline-offset-2">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/terms" className="text-mint underline underline-offset-2">
            Terms
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="press w-full shrink-0 bg-mint px-6 py-2.5 text-[0.82rem] font-bold text-brand-deep sm:w-auto"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
