import { Link } from "react-router-dom";
import { FAQS } from "@/lib/faqs";

export function Help() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">Help centre</h1>
      <p className="mt-3 text-[0.9rem] text-muted">Answers to what people ask us most.</p>

      <div className="mt-8 flex flex-col gap-3">
        {FAQS.map((f) => (
          <details key={f.q} className="card group p-5 open:pb-5">
            <summary className="cursor-pointer list-none text-[0.9rem] font-medium tracking-tight marker:content-none">
              <span className="flex items-center justify-between gap-3">
                {f.q}
                <span className="shrink-0 text-muted transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-[0.82rem] leading-relaxed text-muted">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-[0.82rem] text-muted">
        Can't find it here?{" "}
        <Link to="/contact" className="text-brand underline underline-offset-4">
          Get in touch
        </Link>
        .
      </p>
    </div>
  );
}
