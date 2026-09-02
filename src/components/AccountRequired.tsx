import { Lock } from "lucide-react";
import { authGate } from "@/lib/authGate";
import { Link } from "react-router-dom";

/** Drop-in replacement for a page's content when a guest lands on account-scoped ground directly. */
export function AccountRequired({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-sm px-6 py-24 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-none bg-white/[0.08]">
        <Lock className="h-4 w-4 text-muted" strokeWidth={1.8} />
      </span>
      <h1 className="mt-5 text-[1.3rem] font-semibold tracking-[-0.02em]">{title}</h1>
      <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">{body}</p>
      <button
        type="button"
        onClick={() => authGate.request(body)}
        className="press mt-6 w-full rounded-none bg-brand py-3.5 text-[0.88rem] font-medium tracking-tight text-background"
      >
        Create free account
      </button>
      <p className="mt-4 text-[0.78rem] text-muted">
        Already have one?{" "}
        <Link to="/login" className="text-brand underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
