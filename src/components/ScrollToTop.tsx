import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Module-level (survives route changes, not remounts of this component) —
// scroll offset per history entry, keyed by react-router's own per-entry
// `location.key`. Native `history.scrollRestoration = "auto"` does NOT
// reliably reattach scroll on `popstate` for client-side (pushState-driven)
// navigation the way it does for real full-page loads, so this app has to
// track and restore it itself rather than trust the browser.
const scrollByKey = new Map<string, number>();

/**
 * Every regular navigation (clicking a nav link, a watch, a "Sell your
 * watch" button, etc.) lands at the top of the new page. Back/forward
 * (`POP`) navigation restores whatever scroll position was recorded for
 * that history entry when it was last left — e.g. clicking into an item
 * then going back drops you back where you were in the list, rather than
 * at the top. This only reconstructs the same content because the Browse
 * page's filters are persisted (`browseState`), so the grid re-renders
 * with the same items to scroll back into. A navigation carrying a hash is
 * left alone entirely, in case a page wants its own scroll-to-anchor
 * behaviour on load.
 */
export function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const navType = useNavigationType();
  const keyRef = useRef(key);
  keyRef.current = key;

  // Continuously record the current entry's scroll position as the user
  // scrolls, so it's available to restore if they later navigate back to it.
  useLayoutEffect(() => {
    const onScroll = () => scrollByKey.set(keyRef.current, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    if (hash) return;
    if (navType === "POP") {
      window.scrollTo(0, scrollByKey.get(key) ?? 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, key, navType]);

  return null;
}
