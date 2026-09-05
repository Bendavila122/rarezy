import { Reveal } from "@/components/Reveal";

type Listing = {
  photo: string;
  title: string;
  price: number;
  min: number;
  max: number;
  sold: number;
  daysLeft: number;
};

// A watch dealer's own dashboard, not the public storefront a buyer sees —
// the actual management view: deadline, minimum, total tickets, entries
// sold and revenue for every competition they've got live right now.
const LISTINGS: Listing[] = [
  { photo: "/watches/rolex-datejust-126234-sunburst.jpg", title: "Rolex Datejust 126234", price: 5, min: 1200, max: 2000, sold: 1480, daysLeft: 9 },
  { photo: "/watches/omega-speedmaster-311.jpg", title: "Omega Speedmaster Pro", price: 3, min: 800, max: 1500, sold: 1110, daysLeft: 4 },
  { photo: "/watches/ap-royal-oak-15202.jpg", title: "AP Royal Oak 15202", price: 5, min: 1000, max: 1800, sold: 1760, daysLeft: 1 },
  { photo: "/watches/cartier-santos-galbee.jpg", title: "Cartier Santos de Cartier", price: 2, min: 600, max: 1000, sold: 340, daysLeft: 18 },
  { photo: "/watches/tudor-bb58-gold.jpg", title: "Tudor Black Bay 58", price: 2.5, min: 500, max: 900, sold: 810, daysLeft: 2 },
  { photo: "/watches/patek-calatrava.jpg", title: "Patek Philippe Calatrava", price: 4.5, min: 900, max: 1600, sold: 720, daysLeft: 16 },
  { photo: "/watches/iwc-portugieser-automatic.jpg", title: "IWC Portugieser Automatic", price: 4, min: 700, max: 1200, sold: 528, daysLeft: 11 },
  { photo: "/watches/breitling-navitimer.jpg", title: "Breitling Navitimer", price: 1.5, min: 400, max: 800, sold: 240, daysLeft: 20 },
  { photo: "/watches/grand-seiko-snowflake.jpg", title: "Grand Seiko Snowflake", price: 2, min: 500, max: 1000, sold: 950, daysLeft: 1 },
  { photo: "/watches/rolex-submariner-16610.jpg", title: "Rolex Submariner 16610", price: 3.5, min: 600, max: 1000, sold: 410, daysLeft: 13 },
];

const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`;

const STATS = [
  { label: "Live", value: "10", delta: "+2", accent: "text-white" },
  { label: "Sold", value: "6", delta: "+1", accent: "text-white" },
  { label: "Revenue", value: "£68,940", delta: "+15.7%", accent: "text-amber-300" },
  { label: "Member since", value: "Feb 2026", delta: null, accent: "text-white" },
];

function ListingRow({ l }: { l: Listing }) {
  const pct = Math.round((l.sold / l.max) * 100);
  const hitMin = l.sold >= l.min;
  const urgent = l.daysLeft <= 2;

  return (
    <tr className="border-b border-white/[0.06] last:border-0">
      <td className="whitespace-nowrap py-3 pr-4">
        <div className="flex items-center gap-3">
          <img src={l.photo} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          <p className="text-[0.82rem] tracking-tight text-white">{l.title}</p>
        </div>
      </td>
      <td className="tabular whitespace-nowrap px-4 py-3 text-[0.8rem] text-white/55">{gbp(l.price)}</td>
      <td className="tabular whitespace-nowrap px-4 py-3 text-[0.8rem] text-white/55">{l.min.toLocaleString("en-GB")}</td>
      <td className="tabular whitespace-nowrap px-4 py-3 text-[0.8rem] text-white/55">{l.max.toLocaleString("en-GB")}</td>
      <td className="whitespace-nowrap px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${hitMin ? "bg-emerald-400" : "bg-amber-400"}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <span className="tabular text-[0.74rem] text-white/50">{pct}%</span>
        </div>
        <p className="tabular mt-0.5 text-[0.66rem] text-white/35">{l.sold.toLocaleString("en-GB")} sold</p>
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <span className={`text-[0.78rem] font-medium ${urgent ? "text-red-400" : "text-white/55"}`}>
          {l.daysLeft} {l.daysLeft === 1 ? "day" : "days"} left
        </span>
      </td>
      <td className="tabular whitespace-nowrap py-3 pl-4 text-right text-[0.82rem] font-semibold text-white">
        {gbp(l.sold * l.price)}
      </td>
    </tr>
  );
}

/**
 * The actual seller dashboard a dealer would be looking at, not the public
 * storefront a buyer sees — deadline, minimum, ticket total, entries sold
 * and revenue, per listing. Kept plain and text-led (a simple stat row, no
 * icon-badge tiles, no sparklines, no gradient banner) — an earlier version
 * leaned much closer to a specific competitor's own dashboard visuals, and
 * this pulls it back to something that reads as Rarezy's own rather than a
 * copy of theirs, while keeping the same real, useful data.
 */
export function SellerDashboardMock() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-amber-300">Your dashboard</p>
        <p className="mt-4 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.1rem]">
          Every listing, tracked in real time.
        </p>
        <p className="mt-4 text-[0.9rem] leading-relaxed text-white/60">
          Deadline, minimum, tickets sold, revenue — everything you need to run your stock as competitions,
          for a dealer with 10 live at once.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/60">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5 sm:px-5">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-400">
            <span className="text-[0.6rem] font-black text-[#241a0c]">R</span>
          </span>
          <span className="text-[0.72rem] text-white/40">Seller</span>
          <span className="text-[0.72rem] text-white/25">/</span>
          <span className="text-[0.72rem] font-medium text-white/70">Windsor Watch Co</span>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-[1.1rem] font-bold text-white">Windsor Watch Co</p>
          <p className="text-[0.78rem] text-white/50">Watches, London</p>

          <div className="mt-4 grid grid-cols-2 gap-y-4 border-y border-white/10 py-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className={`tabular text-[1.3rem] font-bold leading-none ${s.accent}`}>{s.value}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.1em] text-white/40">
                  {s.label}
                  {s.delta && <span className="normal-case tracking-normal text-emerald-400">{s.delta}</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-2 pr-4 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/40">Item</th>
                  <th className="px-4 pb-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/40">Ticket</th>
                  <th className="px-4 pb-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/40">Min.</th>
                  <th className="px-4 pb-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/40">Total</th>
                  <th className="px-4 pb-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/40">Sold</th>
                  <th className="px-4 pb-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/40">Deadline</th>
                  <th className="pb-2 pl-4 text-right text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {LISTINGS.map((l) => (
                  <ListingRow key={l.title} l={l} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
