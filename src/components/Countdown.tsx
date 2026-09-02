import { useEffect, useState } from "react";

export function useCountdown(deadlineAt: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, new Date(deadlineAt).getTime() - now);
  const days = Math.floor(remainingMs / 86_400_000);
  const hours = Math.floor((remainingMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1000);

  return { days, hours, minutes, seconds, ended: remainingMs <= 0 };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Winuwatch-style Day / Hour / Min / Sec ticking block, for the item page and featured drop. */
export function CountdownBar({ deadlineAt, className = "" }: { deadlineAt: string; className?: string }) {
  const { days, hours, minutes, seconds, ended } = useCountdown(deadlineAt);

  if (ended) {
    return (
      <div className={`rounded-none bg-black/25 px-4 py-3 text-center text-[0.78rem] font-medium text-white ${className}`}>
        Draw in progress — check back shortly
      </div>
    );
  }

  const units = [
    { label: "Day", value: days },
    { label: "Hour", value: hours },
    { label: "Min", value: minutes },
    { label: "Sec", value: seconds },
  ];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[1.1rem] font-light leading-none text-white/25">:</span>}
          <div className="flex min-w-[2.75rem] flex-col items-center rounded-none bg-white/10 py-1.5">
            <span className="tabular text-[1.15rem] font-bold leading-none text-white">{pad(u.value)}</span>
            <span className="mt-1 text-[0.52rem] font-medium uppercase tracking-[0.14em] text-white/55">
              {u.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Compact ticking "2d 4h left" chip for listing cards — red inside 24h, amber inside 3 days, hidden otherwise. */
export function CountdownBadge({ deadlineAt }: { deadlineAt: string }) {
  const { days, hours, minutes, seconds, ended } = useCountdown(deadlineAt);
  if (ended || days >= 3) return null;

  const text =
    days > 0 ? `${days}d ${hours}h left` : hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m ${seconds}s left`;
  const urgent = days === 0 && hours < 24;

  return (
    <span
      className={`tabular rounded-none px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide ${
        urgent ? "bg-red-500 text-white" : "bg-amber-500 text-white"
      }`}
    >
      {text}
    </span>
  );
}
