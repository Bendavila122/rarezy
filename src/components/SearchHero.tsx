import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { browseState } from "@/lib/browseState";
import { useRarezy, type CompetitionListing } from "@/lib/store";

const TYPE_SPEED = 45;
const CLEAR_SPEED = 18;
const HOLD_MS = 1700;

/** Types out `text`, waits, deletes it, then hands control back to the caller to swap in the next phrase — a loop-friendly single-phrase typewriter. */
function useTypewriterCycle(phrases: readonly string[]) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const text = phrases[index] ?? "";
    if (!clearing) {
      if (display.length < text.length) {
        const id = window.setTimeout(() => setDisplay(text.slice(0, display.length + 1)), TYPE_SPEED);
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => setClearing(true), HOLD_MS);
      return () => window.clearTimeout(id);
    }
    if (display.length > 0) {
      const id = window.setTimeout(() => setDisplay((d) => d.slice(0, -1)), CLEAR_SPEED);
      return () => window.clearTimeout(id);
    }
    setClearing(false);
    setIndex((i) => (i + 1) % phrases.length);
    return undefined;
  }, [display, clearing, index, phrases]);

  return display;
}

/** Compact header search — lives in the nav banner next to the logo. Straight-to-results: no filters or sort here, just type and go. Those live on the Browse page itself, seeded with whatever's typed here via `browseState`. The placeholder types out a loop of what's actually available, one category at a time. Hidden below `sm` — the header's already tight with the full nav on small screens. */
export function SearchHero() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { records } = useRarezy();
  const liveCount = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && r.status === "live",
  ).length;

  const phrases = [
    `Search from ${liveCount} watches`,
    "Search from 24 electronics",
    "Search from 1 cash prize",
    "Search from 16 handbags",
    "Search from 12 clothing items",
    "Search from 8 cars",
  ];
  const typed = useTypewriterCycle(phrases);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    browseState.set({ query });
    navigate("/browse");
  };

  return (
    <form
      onSubmit={submit}
      className="glass-dark relative hidden h-9 w-56 shrink-0 items-center sm:flex lg:w-64"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" strokeWidth={2} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search watches"
        className="w-full rounded-none border-none bg-transparent py-2 pl-9 pr-3 text-[0.8rem] tracking-tight text-white outline-none"
      />
      {query.length === 0 && (
        <span className="pointer-events-none absolute left-9 top-1/2 flex -translate-y-1/2 items-center overflow-hidden text-[0.8rem] tracking-tight text-white/40">
          {typed}
          <span className="ml-0.5 animate-pulse">▌</span>
        </span>
      )}
    </form>
  );
}
