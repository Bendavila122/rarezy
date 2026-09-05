import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/** A grouped-list row that navigates elsewhere — icon, label, chevron — the same iOS-Settings-style row used across account management, instead of a flat row of pill buttons. */
export function AccountLinkRow({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}) {
  return (
    <Link to={to} className="list-row flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/70">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <span className="flex-1 text-[0.9rem] tracking-tight text-foreground">{label}</span>
      {!!badge && (
        <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-mint px-1.5 text-[0.68rem] font-semibold text-brand-deep">
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-muted" strokeWidth={2} />
    </Link>
  );
}
