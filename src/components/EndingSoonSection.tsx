import { Flame } from "lucide-react";
import { useRarezy, type CompetitionListing } from "@/lib/store";
import { ListingCard } from "@/components/ListingCard";
import { Reveal } from "@/components/Reveal";

/** A real section (not a small corner nudge) for the watches closing soonest — reuses the full `ListingCard` so it's genuinely functional, not just decorative. */
export function EndingSoonSection() {
  const { records } = useRarezy();

  const soonest = records
    .filter((r): r is CompetitionListing => r.kind === "competition" && r.status === "live")
    .sort((a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime())
    .slice(0, 4);

  if (soonest.length === 0) return null;

  return (
    <div className="relative z-10 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-[0.32em] text-red-400">
            <Flame className="h-3.5 w-3.5" strokeWidth={2.4} />
            Ending soon
          </p>
          <h2 className="mt-3 text-[1.9rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.5rem]">
            These close first.
          </h2>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-white/55 sm:text-[1rem]">
            The tickets ending soonest, right now. Once the clock runs out, that's it — no extensions.
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {soonest.map((c, i) => (
            <Reveal key={c.id} delay={Math.min(i, 4) * 0.06} y={20}>
              <ListingCard listing={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
