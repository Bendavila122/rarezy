import { Link, useNavigate, useParams } from "react-router-dom";
import { useRarezy } from "@/lib/store";
import { CertificateOfAuthenticity } from "@/components/CertificateOfAuthenticity";

/** Full-page, shareable, print-friendly certificate — the "make it look reputable" moment, on its own with no app chrome competing for attention. */
export function Certificate() {
  const { listingId } = useParams<{ listingId: string }>();
  const { records } = useRarezy();
  const navigate = useNavigate();

  const c = records.find((r) => r.id === listingId && r.kind === "competition");

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/browse");
  };

  if (!c || c.kind !== "competition" || !c.analysisReport) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <button type="button" onClick={goBack} className="text-[0.8rem] text-muted">
          ← Back
        </button>
        <p className="mt-6 text-[0.9rem] text-muted">No certificate found for that listing.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <button type="button" onClick={goBack} className="text-[0.8rem] text-muted">
          ← Back to listing
        </button>
        <Link to={`/item/${c.id}`} className="text-[0.78rem] text-brand underline underline-offset-4">
          View listing
        </Link>
      </div>
      <div className="mt-6">
        <CertificateOfAuthenticity item={c.item} report={c.analysisReport} />
      </div>
    </div>
  );
}
