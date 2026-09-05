import { useEffect, useState } from "react";
import { useRarezy, type CompetitionListing } from "@/lib/store";
import { Reveal } from "@/components/Reveal";

const gbp = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

/** Ticks a number up on its own, the same "this is live" trick used on the seller dashboard's own figures. */
function useLiveNudge(start: number, step: [number, number]) {
  const [value, setValue] = useState(start);
  useEffect(() => {
    const id = window.setInterval(
      () => setValue((v) => v + step[0] + Math.random() * (step[1] - step[0])),
      1600 + Math.random() * 1200,
    );
    return () => window.clearInterval(id);
  }, [step]);
  return value;
}

/**
 * A plain stat row pulling from the app's own real data — live competition
 * count and total value already won by players — plus one gently-ticking
 * "players online" figure, styled the same way as the seller dashboard's
 * own stat row (big number, small label, no icon tiles or sparklines) so
 * the buyer and business sides of the site share one visual language for
 * "here's the real, live product" moments.
 */
export function LiveStatsBand() {
  const { records } = useRarezy();

  const live = records.filter((r): r is CompetitionListing => r.kind === "competition" && r.status === "live");
  const won = records.filter(
    (r): r is CompetitionListing => r.kind === "competition" && r.winnerName !== undefined,
  );
  const valueWon = won.reduce((sum, c) => sum + c.item.purchasePrice, 0);
  const playersOnline = useLiveNudge(340, [-1, 2]);

  const STATS = [
    { value: live.length.toLocaleString("en-GB"), label: "Live competitions" },
    { value: won.length.toLocaleString("en-GB"), label: "Watches won so far" },
    { value: gbp(valueWon), label: "Value won by players" },
    { value: Math.max(60, Math.round(playersOnline)).toLocaleString("en-GB"), label: "Players online now" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-mint">Right now on Rarezy</p>
      </Reveal>

      <Reveal delay={0.08} className="mt-8 grid grid-cols-2 gap-y-6 border-y border-white/10 py-6 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="tabular text-[1.5rem] font-bold leading-none text-white">{s.value}</p>
            <p className="mt-1.5 text-[0.66rem] uppercase tracking-[0.1em] text-white/40">{s.label}</p>
          </div>
        ))}
      </Reveal>
    </div>
  );
}
