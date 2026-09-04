import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { auth, AUTH_DEMO_MODE } from "@/lib/auth";
import { FieldGroup, FieldRow, FieldInput, PasswordFieldInput } from "@/components/AuthField";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { reason?: string; next?: string } | null;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setBusy(true);
    setError(null);
    try {
      await auth.signInWithPassword(identifier.trim(), password);
      navigate(state?.next ?? "/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't sign you in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-sm flex-col justify-center px-6 py-10">
      <div className="glass-dark rounded-[32px] p-7 sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-mint/15 shadow-[0_8px_24px_-8px_oklch(0.82_0.19_148_/_50%)]">
          <Lock className="h-6 w-6 text-mint" strokeWidth={1.8} />
        </span>
        <h1 className="mt-5 text-center text-[1.5rem] font-semibold leading-tight tracking-[-0.02em]">Log in</h1>
        <p className="mt-1.5 text-center text-[0.82rem] leading-relaxed text-white/55">
          {state?.reason ? `${state.reason} ` : ""}Welcome back.
        </p>

        {AUTH_DEMO_MODE && (
          <p className="mt-5 rounded-2xl border border-mint/20 bg-mint/[0.08] px-3.5 py-2.5 text-[0.7rem] leading-relaxed text-mint/80">
            Live accounts aren't connected yet — this runs in demo mode, so any username and password works.
          </p>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <FieldGroup>
            <FieldRow label="Username or email">
              <FieldInput
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="steelandgold"
              />
            </FieldRow>
            <FieldRow label="Password">
              <PasswordFieldInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </FieldRow>
          </FieldGroup>

          {error && <p className="text-center text-[0.78rem] text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={!identifier.trim() || !password || busy}
            className="press mt-1 w-full rounded-full bg-mint py-4 text-[0.9rem] font-semibold tracking-tight text-brand-deep disabled:opacity-40"
          >
            {busy ? "Signing in…" : "Log in"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-[0.8rem] text-white/50">
        New to Rarezy?{" "}
        <Link to="/signup" state={state} className="font-medium text-mint underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
