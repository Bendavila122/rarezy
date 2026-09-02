import { useState } from "react";
import { Mail } from "lucide-react";

const labelCls = "text-[0.62rem] uppercase tracking-[0.24em] text-muted";
const inputCls =
  "mt-3 w-full rounded-none border border-white/10 bg-white/[0.04] px-5 py-4 text-[16px] tracking-tight text-foreground outline-none placeholder:text-muted/60 focus:border-brand/40";

export function Contact() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const canSend = name.trim() && email.trim() && message.trim();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.03em]">Contact us</h1>
      <p className="mt-3 max-w-lg text-[0.9rem] leading-relaxed text-muted">
        Questions about a listing, a payout, or authentication — we usually reply within one
        working day.
      </p>

      <p className="mt-6 flex items-center gap-2 text-[0.85rem] text-muted">
        <Mail className="h-4 w-4" strokeWidth={1.8} />
        hello@rarezy.co.uk
      </p>

      {sent ? (
        <div className="card mt-8 p-6">
          <p className={labelCls}>Message sent</p>
          <p className="mt-3 text-[0.9rem] leading-relaxed">
            Thanks, {name.split(" ")[0]} — we'll get back to you at {email} shortly.
          </p>
        </div>
      ) : (
        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSend) setSent(true);
          }}
        >
          <p className={labelCls}>Name</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jamie Carter" className={inputCls} />

          <p className={`${labelCls} mt-5`}>Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
          />

          <p className={`${labelCls} mt-5`}>Message</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="How can we help?"
            className={`${inputCls} resize-none`}
          />

          <button
            type="submit"
            disabled={!canSend}
            className="mt-6 w-full rounded-none bg-brand py-4 text-[0.9rem] font-medium tracking-tight text-background disabled:opacity-30"
          >
            Send message
          </button>
        </form>
      )}
    </div>
  );
}
