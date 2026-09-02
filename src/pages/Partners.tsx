import { AFFILIATE_PARTNERS } from "@/lib/affiliates";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";

export function Partners() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-[1.9rem] font-semibold tracking-[-0.03em]">Partner services</h1>
      <p className="mt-3 text-[0.85rem] leading-relaxed text-muted">
        A shortlist of services useful to a watch owner — insurance, servicing, storage and more.
        These are demo partners; live booking links go here once agreements are signed.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {AFFILIATE_PARTNERS.map((p) => (
          <div key={p.id} className="card p-5">
            <p className={labelCls}>{p.category}</p>
            <p className="mt-1.5 text-[0.95rem] font-medium tracking-tight">{p.name}</p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-muted">{p.blurb}</p>
            <button
              type="button"
              disabled
              className="mt-4 rounded-none bg-white/[0.05] px-4 py-2 text-[0.78rem] font-medium text-muted"
            >
              {p.cta} — coming soon
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
