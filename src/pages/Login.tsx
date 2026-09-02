import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { auth, AUTH_DEMO_MODE } from "@/lib/auth";

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
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-sm flex-col justify-center px-6 py-16">
      <span className="flex h-9 w-9 items-center justify-center rounded-none bg-white/10">
        <Lock className="h-4 w-4 text-mint" strokeWidth={1.8} />
      </span>
      <h1 className="mt-4 text-[1.6rem] font-semibold leading-tight tracking-[-0.02em]">Log in</h1>
      <p className="mt-1.5 text-[0.82rem] leading-relaxed text-white/60">
        {state?.reason ? `${state.reason} ` : ""}Welcome back.
      </p>

      {AUTH_DEMO_MODE && (
        <p className="mt-4 rounded-none border border-mint/25 bg-mint/[0.06] px-3 py-2 text-[0.68rem] leading-relaxed text-mint/80">
          Live accounts aren't connected yet — this runs in demo mode, so any username and password works.
        </p>
      )}

      <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="text-[0.62rem] uppercase tracking-[0.24em] text-white/40">Username or email</label>
          <input
            autoFocus
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="steelandgold"
            className="mt-2 w-full rounded-none border border-white/15 bg-white/5 px-4 py-3.5 text-[16px] tracking-tight text-white outline-none placeholder:text-white/30 focus:border-mint/50"
          />
        </div>
        <div>
          <label className="text-[0.62rem] uppercase tracking-[0.24em] text-white/40">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-2 w-full rounded-none border border-white/15 bg-white/5 px-4 py-3.5 text-[16px] tracking-tight text-white outline-none placeholder:text-white/30 focus:border-mint/50"
          />
        </div>

        {error && <p className="text-[0.76rem] text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={!identifier.trim() || !password || busy}
          className="press mt-1 w-full rounded-none bg-mint py-3.5 text-[0.88rem] font-semibold tracking-tight text-brand-deep disabled:opacity-40"
        >
          {busy ? "Signing in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-[0.78rem] text-white/50">
        New to Rarezy?{" "}
        <Link
          to="/signup"
          state={state}
          className="text-brand underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
