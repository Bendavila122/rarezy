import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Every regular navigation (clicking a nav link, a watch, a "Sell your
 * watch" button, etc.) lands at the top of the new page. Back/forward
 * (`POP`) navigation is left alone so the browser's own scroll restoration
 * can put the user back where they were — which only works because the
 * Browse page's filters are persisted (`browseState`) and reconstruct the
 * same grid. A navigation carrying a hash is left alone too, in case a
 * future page wants its own scroll-to-anchor behaviour on load.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === "POP") return;
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navType]);

  return null;
}
