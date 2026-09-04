import { useRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

/** iOS Settings-style grouped row container — one rounded card, rows divided by hairlines instead of each field having its own separate box. */
export function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-white/10 overflow-hidden rounded-2xl bg-white/[0.06]">{children}</div>;
}

/** One row inside a `FieldGroup` — small label above the value, no border of its own. */
export function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-2.5">
      <label className="text-[0.62rem] uppercase tracking-[0.22em] text-white/40">{label}</label>
      {children}
    </div>
  );
}

const fieldInputCls =
  "mt-1 w-full border-none bg-transparent p-0 text-[16px] tracking-tight text-white outline-none placeholder:text-white/25";

export function FieldInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldInputCls} ${props.className ?? ""}`} />;
}

/** A `FieldInput` with a trailing eye toggle — the iOS Password-field pattern. */
export function PasswordFieldInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mt-1 flex items-center gap-2">
      <input {...props} type={visible ? "text" : "password"} className={`${fieldInputCls} mt-0`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="shrink-0 text-white/40 active:opacity-60"
      >
        {visible ? <EyeOff className="h-4 w-4" strokeWidth={1.8} /> : <Eye className="h-4 w-4" strokeWidth={1.8} />}
      </button>
    </div>
  );
}

/** iOS Messages-style six-box verification code entry — auto-advances per digit, supports pasting the whole code in one go, backspace steps back a box. */
export function OtpInput({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const setDigit = (i: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (!clean) {
      onChange(value.slice(0, i) + value.slice(i + 1));
      return;
    }
    if (clean.length > 1) {
      // A paste landed here — spread it across the remaining boxes.
      const next = (value.slice(0, i) + clean).slice(0, 6);
      onChange(next);
      refs.current[Math.min(next.length, 5)]?.focus();
      return;
    }
    const next = (value.slice(0, i) + clean + value.slice(i + 1)).slice(0, 6);
    onChange(next);
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          autoFocus={autoFocus && i === 0}
          inputMode="numeric"
          maxLength={6}
          value={d}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-14 w-11 rounded-2xl border border-white/15 bg-white/[0.06] text-center text-[1.3rem] font-semibold text-white outline-none focus:border-mint/60 focus:bg-white/[0.1]"
        />
      ))}
    </div>
  );
}
