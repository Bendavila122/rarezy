import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { browseState } from "@/lib/browseState";
import { useRarezy, type CompetitionListing } from "@/lib/store";

/** Straight-to-results search in the header, next to the logo — no filters or sort here, just type and go. Those live on the Browse page itself, seeded with whatever's typed here via `browseState`. */
export function HeaderSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { records } = useRarezy();
  const liveCount = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && r.status === "live",
  ).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    browseState.set({ query });
    navigate("/browse");
  };

  return (
    <form onSubmit={submit} className="glass-dark relative hidden h-9 w-48 items-center sm:flex lg:w-60">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" strokeWidth={2} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${liveCount} watches`}
        className="w-full rounded-none border-none bg-transparent py-2 pl-9 pr-3 text-[0.78rem] tracking-tight text-white outline-none placeholder:text-white/40"
      />
    </form>
  );
}
