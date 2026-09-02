import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, ChevronLeft, Mail, ShieldCheck } from "lucide-react";
import { auth, AUTH_DEMO_MODE } from "@/lib/auth";

const STEPS = ["Email", "Verify", "Username", "Password", "ID check"] as const;

const inputCls =
  "mt-2 w-full rounded-none border border-white/15 bg-white/5 px-4 py-3.5 text-[16px] tracking-tight text-white outline-none placeholder:text-white/30 focus:border-mint/50";
const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-white/40";
const primaryBtnCls =
  "press w-full rounded-none bg-mint py-3.5 text-[0.88rem] font-semibold tracking-tight text-brand-deep disabled:opacity-40";

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((label, i) => (
        <div key={label} className="flex-1">
          <div className="h-[3px] w-full overflow-hidden rounded-none bg-white/10">
            <motion.div
              className="h-full bg-mint"
              initial={false}
              animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className={`mt-1.5 text-[0.58rem] uppercase tracking-[0.16em] ${i <= step ? "text-white/70" : "text-white/30"}`}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function Signup() {
  const location = useLocation();
  const [params] = useSearchParams();
  const state = location.state as { reason?: string; next?: string } | null;

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idSubmitted, setIdSubmitted] = useState(false);

  // Stripe Identity's hosted flow redirects back to this same URL with
  // ?step=done once the user finishes uploading documents there.
  useEffect(() => {
    if (params.get("step") === "done") {
      setStep(4);
      setIdSubmitted(true);
    }
  }, [params]);

  const back = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setBusy(true);
    setError(null);
    try {
      await auth.sendVerificationCode(email.trim());
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send that code.");
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) return;
    setBusy(true);
    setError(null);
    try {
      const ok = await auth.verifyCode(email.trim(), code.trim());
      if (!ok) throw new Error("That code isn't right — check your email and try again.");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't verify that code.");
    } finally {
      setBusy(false);
    }
  };

  const submitUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const available = await auth.checkUsernameAvailable(username.trim());
      if (!available) throw new Error("That username is already taken.");
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't check that username.");
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await auth.signUpWithPassword({ email: email.trim(), username: username.trim(), password });
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create your account.");
    } finally {
      setBusy(false);
    }
  };

  const startIdCheck = async () => {
    setBusy(true);
    setError(null);
    try {
      const returnUrl = `${window.location.origin}/signup?step=done`;
      const url = await auth.startIdentityVerification(returnUrl);
      if (url) {
        window.location.href = url;
        return;
      }
      // Demo mode: no real Stripe session — simulate the round trip.
      await new Promise((r) => setTimeout(r, 900));
      setIdSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start ID verification.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-sm flex-col justify-center px-6 py-16">
      {!idSubmitted && (
        <>
          <ProgressBar step={step} />
          {AUTH_DEMO_MODE && (
            <p className="mt-5 rounded-none border border-mint/25 bg-mint/[0.06] px-3 py-2 text-[0.68rem] leading-relaxed text-mint/80">
              Live accounts aren't connected yet — this runs in demo mode, so email codes and ID
              verification are simulated.
            </p>
          )}
        </>
      )}

      {step === 0 && !idSubmitted && (
        <form onSubmit={submitEmail} className="mt-6 flex flex-col gap-4">
          <div>
            <h1 className="text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">What's your email?</h1>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-white/60">
              {state?.reason ? `${state.reason} ` : ""}We'll send a code to verify it.
            </p>
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>
          {error && <p className="text-[0.76rem] text-red-400">{error}</p>}
          <button type="submit" disabled={!email.includes("@") || busy} className={primaryBtnCls}>
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      )}

      {step === 1 && !idSubmitted && (
        <form onSubmit={submitCode} className="mt-6 flex flex-col gap-4">
          <div>
            <span className="flex h-9 w-9 items-center justify-center rounded-none bg-white/10">
              <Mail className="h-4 w-4 text-mint" strokeWidth={1.8} />
            </span>
            <h1 className="mt-4 text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">Check your inbox</h1>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-white/60">
              Enter the 6-digit code we sent to {email}.
            </p>
          </div>
          <div>
            <label className={labelCls}>Verification code</label>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className={`${inputCls} text-center text-[1.2rem] tracking-[0.4em]`}
            />
          </div>
          {error && <p className="text-[0.76rem] text-red-400">{error}</p>}
          <button type="submit" disabled={code.length !== 6 || busy} className={primaryBtnCls}>
            {busy ? "Verifying…" : "Verify"}
          </button>
          <button type="button" onClick={back} className="flex items-center justify-center gap-1 text-[0.76rem] text-white/50">
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back
          </button>
        </form>
      )}

      {step === 2 && !idSubmitted && (
        <form onSubmit={submitUsername} className="mt-6 flex flex-col gap-4">
          <div>
            <h1 className="text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">Pick a username</h1>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-white/60">
              This is what shows on leaderboards and the winners wall — never your real name.
            </p>
          </div>
          <div>
            <label className={labelCls}>Username</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="steelandgold"
              className={inputCls}
            />
          </div>
          {error && <p className="text-[0.76rem] text-red-400">{error}</p>}
          <button type="submit" disabled={!username.trim() || busy} className={primaryBtnCls}>
            {busy ? "Checking…" : "Continue"}
          </button>
          <button type="button" onClick={back} className="flex items-center justify-center gap-1 text-[0.76rem] text-white/50">
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back
          </button>
        </form>
      )}

      {step === 3 && !idSubmitted && (
        <form onSubmit={submitPassword} className="mt-6 flex flex-col gap-4">
          <div>
            <h1 className="text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">Create a password</h1>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-white/60">At least 8 characters.</p>
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Repeat password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
          </div>
          {error && <p className="text-[0.76rem] text-red-400">{error}</p>}
          <button type="submit" disabled={!password || !confirmPassword || busy} className={primaryBtnCls}>
            {busy ? "Creating account…" : "Continue"}
          </button>
          <button type="button" onClick={back} className="flex items-center justify-center gap-1 text-[0.76rem] text-white/50">
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Back
          </button>
        </form>
      )}

      {step === 4 && !idSubmitted && (
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <span className="flex h-9 w-9 items-center justify-center rounded-none bg-white/10">
              <ShieldCheck className="h-4 w-4 text-mint" strokeWidth={1.8} />
            </span>
            <h1 className="mt-4 text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">Verify your ID</h1>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-white/60">
              One last step — UK law requires we verify your identity and address before you can win
              a watch. You'll need a photo ID and a proof of address (utility bill or bank
              statement). This takes about 2 minutes.
            </p>
          </div>
          {error && <p className="text-[0.76rem] text-red-400">{error}</p>}
          <button type="button" onClick={startIdCheck} disabled={busy} className={primaryBtnCls}>
            {busy ? "Starting…" : "Start ID verification"}
          </button>
        </div>
      )}

      {idSubmitted && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-none bg-mint/15">
            <CheckCircle2 className="h-6 w-6 text-mint" strokeWidth={1.8} />
          </span>
          <h1 className="mt-5 text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">Verification submitted</h1>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-white/60">
            We're reviewing your documents now. You'll get an email as soon as you're verified —
            usually within a few minutes — and then you can log in.
          </p>
          <Link
            to={AUTH_DEMO_MODE ? (state?.next ?? "/account") : "/login"}
            className="press mt-6 w-full rounded-none bg-mint py-3.5 text-center text-[0.88rem] font-semibold tracking-tight text-brand-deep"
          >
            {AUTH_DEMO_MODE ? "Continue" : "Go to login"}
          </Link>
        </motion.div>
      )}

      {step === 0 && !idSubmitted && (
        <p className="mt-6 text-center text-[0.78rem] text-white/50">
          Already have an account?{" "}
          <Link to="/login" state={state} className="text-brand underline underline-offset-4">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
