/** A tiny inline "trending up" line — no charting library needed for a fixed decorative trend, shared by every stat-tile-style card across the business page. */
export function Sparkline({ color, className = "mt-1.5 h-5 w-16" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 24" className={className} fill="none">
      <polyline
        points="0,20 10,17 20,18 30,11 42,13 52,5 64,7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
