import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, ChevronLeft, Mail, ShieldCheck, Store, Trophy } from "lucide-react";
import { auth, AUTH_DEMO_MODE } from "@/lib/auth";
import { FieldGroup, FieldRow, FieldInput, PasswordFieldInput, OtpInput } from "@/components/AuthField";

type AccountType = "competitor" | "dealer";

// The dealer track skips personal ID verification (step 5) — a business
// gets verified through its seller application instead, so its wizard is
// one step shorter than a competitor's.
function totalSteps(accountType: AccountType | null) {
  return accountType === "dealer" ? 5 : 6;
}

const primaryBtnCls =
  "press w-full rounded-full bg-mint py-4 text-[0.9rem] font-semibold tracking-tight text-brand-deep disabled:opacity-40";

function StepIcon({ Icon }: { Icon: typeof Mail }) {
  return (
    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-mint/15 shadow-[0_8px_24px_-8px_oklch(0.82_0.19_148_/_50%)]">
      <Icon className="h-6 w-6 text-mint" strokeWidth={1.8} />
    </span>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="press -ml-2 flex items-center gap-0.5 self-start rounded-full py-1.5 pl-1 pr-3 text-[0.82rem] font-medium text-white/55"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
      Back
    </button>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-mint"
          initial={false}
          animate={{ width: `${((step + 1) / total) * 100}%` }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="tabular shrink-0 text-[0.68rem] font-medium text-white/45">
        {step + 1}/{total}
      </span>
    </div>
  );
}

export function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const state = location.state as { reason?: string; next?: string } | null;

  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
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
      setStep(5);
      setIdSubmitted(true);
    }
  }, [params]);

  const chooseAccountType = (type: AccountType) => {
    setAccountType(type);
    setStep(1);
  };

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
      if (accountType === "dealer") {
        // No personal ID check for a business — their next step is the real
        // seller application (business name, contact details, category),
        // which already lives at /seller.
        navigate("/seller");
        return;
      }
      setStep(5);
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
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-sm flex-col justify-center px-6 py-10">
      <div className="glass-dark rounded-[32px] p-7 sm:p-8">
        {!idSubmitted && (
          <>
            <ProgressBar step={step} total={totalSteps(accountType)} />
            {AUTH_DEMO_MODE && (
              <p className="mt-4 rounded-2xl border border-mint/20 bg-mint/[0.08] px-3.5 py-2.5 text-[0.7rem] leading-relaxed text-mint/80">
                Live accounts aren't connected yet — this runs in demo mode, so email codes and ID
                verification are simulated.
              </p>
            )}
          </>
        )}

        {step === 0 && !idSubmitted && (
          <div className="mt-5 flex flex-col gap-5">
            <div>
              <h1 className="text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">
                What brings you to Rarezy?
              </h1>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-white/55">
                This decides which account you get — it can't be changed later.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => chooseAccountType("competitor")}
                className="press flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:border-mint/30"
              >
                <StepIcon Icon={Trophy} />
                <span>
                  <span className="block text-[0.95rem] font-semibold tracking-tight">Competitor</span>
                  <span className="mt-1 block text-[0.76rem] leading-relaxed text-white/55">
                    Browse competitions, buy tickets and play to win.
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => chooseAccountType("dealer")}
                className="press flex items-start gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:border-mint/30"
              >
                <StepIcon Icon={Store} />
                <span>
                  <span className="block text-[0.95rem] font-semibold tracking-tight">Dealer</span>
                  <span className="mt-1 block text-[0.76rem] leading-relaxed text-white/55">
                    List your own stock as competitions and reach Rarezy's customers.
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        {step === 1 && !idSubmitted && (
          <form onSubmit={submitEmail} className="mt-5 flex flex-col gap-5">
            <div>
              <h1 className="text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">What's your email?</h1>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-white/55">
                {state?.reason ? `${state.reason} ` : ""}We'll send a code to verify it.
              </p>
            </div>
            <FieldGroup>
              <FieldRow label="Email">
                <FieldInput
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </FieldRow>
            </FieldGroup>
            {error && <p className="text-[0.78rem] text-red-400">{error}</p>}
            <button type="submit" disabled={!email.includes("@") || busy} className={primaryBtnCls}>
              {busy ? "Sending…" : "Send code"}
            </button>
            <BackButton onClick={back} />
          </form>
        )}

        {step === 2 && !idSubmitted && (
          <form onSubmit={submitCode} className="mt-5 flex flex-col gap-5">
            <div>
              <StepIcon Icon={Mail} />
              <h1 className="mt-4 text-center text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">
                Check your inbox
              </h1>
              <p className="mt-1.5 text-center text-[0.82rem] leading-relaxed text-white/55">
                Enter the 6-digit code we sent to {email}.
              </p>
            </div>
            <OtpInput value={code} onChange={setCode} autoFocus />
            {error && <p className="text-center text-[0.78rem] text-red-400">{error}</p>}
            <button type="submit" disabled={code.length !== 6 || busy} className={primaryBtnCls}>
              {busy ? "Verifying…" : "Verify"}
            </button>
            <BackButton onClick={back} />
          </form>
        )}

        {step === 3 && !idSubmitted && (
          <form onSubmit={submitUsername} className="mt-5 flex flex-col gap-5">
            <div>
              <h1 className="text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">Pick a username</h1>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-white/55">
                This is what shows on leaderboards and the winners wall — never your real name.
              </p>
            </div>
            <FieldGroup>
              <FieldRow label="Username">
                <FieldInput
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="steelandgold"
                />
              </FieldRow>
            </FieldGroup>
            {error && <p className="text-[0.78rem] text-red-400">{error}</p>}
            <button type="submit" disabled={!username.trim() || busy} className={primaryBtnCls}>
              {busy ? "Checking…" : "Continue"}
            </button>
            <BackButton onClick={back} />
          </form>
        )}

        {step === 4 && !idSubmitted && (
          <form onSubmit={submitPassword} className="mt-5 flex flex-col gap-5">
            <div>
              <h1 className="text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">Create a password</h1>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-white/55">At least 8 characters.</p>
            </div>
            <FieldGroup>
              <FieldRow label="Password">
                <PasswordFieldInput
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </FieldRow>
              <FieldRow label="Repeat password">
                <PasswordFieldInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </FieldRow>
            </FieldGroup>
            {error && <p className="text-[0.78rem] text-red-400">{error}</p>}
            <button type="submit" disabled={!password || !confirmPassword || busy} className={primaryBtnCls}>
              {busy ? "Creating account…" : "Continue"}
            </button>
            <BackButton onClick={back} />
          </form>
        )}

        {step === 5 && !idSubmitted && (
          <div className="mt-5 flex flex-col gap-5">
            <div>
              <StepIcon Icon={ShieldCheck} />
              <h1 className="mt-4 text-center text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">
                Verify your ID
              </h1>
              <p className="mt-1.5 text-center text-[0.82rem] leading-relaxed text-white/55">
                One last step — UK law requires we verify your identity and address before you can win
                a watch. You'll need a photo ID and a proof of address (utility bill or bank
                statement). This takes about 2 minutes.
              </p>
            </div>
            {error && <p className="text-center text-[0.78rem] text-red-400">{error}</p>}
            <button type="button" onClick={startIdCheck} disabled={busy} className={primaryBtnCls}>
              {busy ? "Starting…" : "Start ID verification"}
            </button>
          </div>
        )}

        {idSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-4 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-mint/15 shadow-[0_8px_24px_-8px_oklch(0.82_0.19_148_/_50%)]">
              <CheckCircle2 className="h-6 w-6 text-mint" strokeWidth={1.8} />
            </span>
            <h1 className="mt-5 text-[1.4rem] font-semibold leading-tight tracking-[-0.02em]">
              Verification submitted
            </h1>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-white/55">
              We're reviewing your documents now. You'll get an email as soon as you're verified —
              usually within a few minutes — and then you can log in.
            </p>
            <Link
              to={AUTH_DEMO_MODE ? (state?.next ?? "/browse") : "/login"}
              className="press mt-6 w-full rounded-full bg-mint py-4 text-center text-[0.9rem] font-semibold tracking-tight text-brand-deep"
            >
              {AUTH_DEMO_MODE ? "Continue" : "Go to login"}
            </Link>
          </motion.div>
        )}
      </div>

      {step === 0 && !idSubmitted && (
        <p className="mt-6 text-center text-[0.8rem] text-white/50">
          Already have an account?{" "}
          <Link to="/login" state={state} className="font-medium text-mint underline underline-offset-4">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
