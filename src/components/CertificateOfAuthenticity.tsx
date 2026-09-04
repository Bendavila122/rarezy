import { BadgeCheck, ShieldCheck } from "lucide-react";
import { formatDate, titleOf, type AnalysisReport, type LuxuryItem } from "@/lib/marketplace";

/**
 * A certificate is meant to read as an official document, not another app
 * screen — deliberately a different visual register from the rest of the
 * site's dark glass/green UI: a cream card, gold double-rule border, serif
 * headings, wax-seal mark. Reused embedded on `ItemDetail`, full-page at
 * `/certificate/:listingId`, and as a live preview while an admin fills in
 * the generation form.
 */
export function CertificateOfAuthenticity({
  item,
  report,
  compact = false,
}: {
  item: LuxuryItem;
  report: AnalysisReport;
  /** Smaller padding/type for embedding inside another card rather than as the page's whole content. */
  compact?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-none border-[3px] border-double border-[#b3924a] bg-[#f6efe0] text-[#2a2110] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] ${
        compact ? "p-6 sm:p-8" : "p-8 sm:p-14"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-3 border border-[#b3924a]/50"
        aria-hidden
      />

      <div className="relative flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#b3924a] text-[#8a6d24]">
          <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <p className="mt-4 text-[0.66rem] uppercase tracking-[0.32em] text-[#8a6d24]">Rarezy Authentication</p>
        <h2 className="font-serif mt-2 text-[1.5rem] font-semibold tracking-[-0.01em] sm:text-[1.8rem]">
          Certificate of Authenticity
        </h2>
        <div className="mt-4 h-px w-24 bg-[#b3924a]/60" />

        <p className="font-serif mt-6 text-[1.1rem] leading-snug sm:text-[1.3rem]">{titleOf(item)}</p>
        <p className="mt-1 text-[0.72rem] uppercase tracking-[0.18em] text-[#8a6d24]">{item.brand}</p>

        <p className="mt-6 max-w-md text-[0.85rem] leading-relaxed text-[#4a3c1e]">{report.summary}</p>
      </div>

      <div className="relative mt-8 overflow-hidden rounded-none border border-[#b3924a]/50">
        {report.findings.map((f, i) => (
          <div
            key={f.label}
            className={`flex items-start justify-between gap-4 px-4 py-3 text-[0.8rem] ${
              i % 2 === 1 ? "bg-[#b3924a]/[0.08]" : ""
            }`}
          >
            <span className="text-[#4a3c1e]">{f.label}</span>
            <span
              className={`shrink-0 text-right font-medium ${f.flagged ? "text-[#8a3f1e]" : "text-[#3d6b3d]"}`}
            >
              {f.note}
            </span>
          </div>
        ))}
      </div>

      <div className="relative mt-8 flex flex-col items-center gap-1 text-center text-[0.74rem] text-[#4a3c1e]">
        <p className="flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5 text-[#8a6d24]" strokeWidth={2} />
          Inspected and certified by {report.inspectorName}, Rarezy
        </p>
        <p>Issued {formatDate(report.generatedAt)} · Certificate {report.certificateId}</p>
        <p className="mt-2 max-w-sm text-[0.7rem] leading-relaxed text-[#6b5a30]">
          Held in Rarezy's insured safe deposit vault for the full duration it remains in our
          possession.
        </p>
      </div>
    </div>
  );
}
