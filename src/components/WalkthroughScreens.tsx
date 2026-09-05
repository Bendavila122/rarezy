import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { SIZE } from "@/lib/game2048";
import { useElementSize } from "@/lib/useElementSize";
import { useMergeSim } from "@/lib/useMergeSim";
import { themeFor } from "@/lib/watchTiles";

export const gbp = (n: number) => `£${n.toLocaleString("en-GB")}`;

export function CountUp({ to, duration = 900 }: { to: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <>{gbp(value)}</>;
}

/** Small "always there" chrome at the top of every screen state, so the swaps below it read as one app, not four different screenshots. */
function ScreenChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col px-3 pb-3 pt-8">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="text-[0.62rem] font-bold tracking-tight text-white">Rarezy</p>
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10">
          <Search className="h-2 w-2 text-white/50" strokeWidth={2.5} />
        </div>
      </div>
      {children}
    </div>
  );
}

export function BrowseScreen() {
  return (
    <ScreenChrome>
      <div className="overflow-hidden rounded-lg bg-white/[0.06]">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img src="/watches/rolex-daytona-16520.jpg" alt="" className="h-full w-full object-cover" />
          <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 backdrop-blur">
            <span className="live-dot h-1 w-1 rounded-full bg-mint" />
            <span className="text-[0.42rem] font-bold uppercase tracking-widest text-white">Live</span>
          </div>
        </div>
        <div className="p-2">
          <p className="text-[0.56rem] font-semibold text-white">Rolex · Daytona 16520</p>
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-[0.48rem] text-white/45">From</p>
            <p className="text-[0.62rem] font-bold text-mint">£2.00</p>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[64%] rounded-full bg-mint" />
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-1.5 opacity-40">
        <div className="h-8 rounded-lg bg-white/[0.05]" />
        <div className="h-8 rounded-lg bg-white/[0.05]" />
      </div>
    </ScreenChrome>
  );
}

const PLAY_GAP_PX = 4;
const PLAY_PAD_PX = 6;
const PLAY_TILE_TRANSITION = { type: "tween", duration: 0.14, ease: [0.22, 1, 0.36, 1] } as const;

/** The real Rarezy Merge engine (via `useMergeSim`), not a hand-staged grid — this shows genuine live gameplay rather than a one-time faked reveal. */
export function PlayScreen() {
  const [boardRef, boardSize] = useElementSize<HTMLDivElement>();
  const { tiles, score } = useMergeSim();
  const cellSize = boardSize > 0 ? (boardSize - PLAY_PAD_PX * 2 - PLAY_GAP_PX * (SIZE - 1)) / SIZE : 0;
  const posFor = (i: number) => PLAY_PAD_PX + i * (cellSize + PLAY_GAP_PX);

  return (
    <ScreenChrome>
      <div className="flex items-center justify-between">
        <p className="text-[0.48rem] uppercase tracking-[0.2em] text-white/45">Your move</p>
        <p className="tabular text-[0.62rem] font-bold text-white">{score}</p>
      </div>
      <div ref={boardRef} className="relative mt-2 aspect-square w-full rounded-lg bg-white/[0.04]">
        {cellSize > 0 && (
          <AnimatePresence>
            {tiles.map((t) => {
              const theme = themeFor(t.value);
              return (
                <motion.div
                  key={t.id}
                  initial={{ x: posFor(t.c), y: posFor(t.r), scale: 0.4, opacity: 0 }}
                  animate={{ x: posFor(t.c), y: posFor(t.r), scale: 1, opacity: 1 }}
                  exit={{ transition: { duration: 0 } }}
                  transition={PLAY_TILE_TRANSITION}
                  className="absolute left-0 top-0 flex items-center justify-center rounded-md"
                  style={{ width: cellSize, height: cellSize, background: theme.bg }}
                >
                  {theme.logo ? (
                    <div className="flex h-[62%] w-[72%] items-center justify-center rounded-sm bg-white p-[2px]">
                      <img src={theme.logo} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <Sparkles className="h-2.5 w-2.5" style={{ color: theme.badge }} />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
      <p className="mt-2 text-center text-[0.48rem] text-white/40">Merge your way to the top of the board</p>
    </ScreenChrome>
  );
}

export function WinScreen() {
  return (
    <ScreenChrome>
      <div className="flex flex-col items-center pt-3 text-center">
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="brand-glow flex h-10 w-10 items-center justify-center rounded-full bg-mint"
        >
          <Check className="h-5 w-5 text-brand-deep" strokeWidth={3} />
        </motion.div>
        <p className="mt-2 text-[0.62rem] font-bold text-white">You won it</p>
        <div className="mt-2.5 w-full overflow-hidden rounded-lg">
          <img src="/watches/rolex-daytona-16520.jpg" alt="" className="h-14 w-full object-cover" />
        </div>
        <div className="mt-2 flex w-full items-center justify-between rounded-lg bg-white/[0.06] px-2 py-1.5">
          <div>
            <p className="text-[0.4rem] uppercase tracking-widest text-white/40">Worth</p>
            <p className="text-[0.56rem] font-semibold text-white/70 line-through">{gbp(11900)}</p>
          </div>
          <div className="text-right">
            <p className="text-[0.4rem] uppercase tracking-widest text-white/40">You paid</p>
            <p className="text-[0.62rem] font-bold text-mint">
              <CountUp to={2} />
            </p>
          </div>
        </div>
      </div>
    </ScreenChrome>
  );
}

export function ListScreen() {
  return (
    <ScreenChrome>
      <div className="overflow-hidden rounded-lg bg-white/[0.06] p-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md">
            <img src="/watches/omega-speedmaster-311.jpg" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.54rem] font-semibold text-white">Omega Speedmaster</p>
            <p className="text-[0.44rem] text-white/40">311.30.42.30.01.005</p>
          </div>
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {["Condition", "Box & papers", "Year"].map((label, i) => (
          <div key={label} className="flex items-center justify-between rounded-md bg-white/[0.05] px-2 py-1.5">
            <span className="text-[0.46rem] text-white/40">{label}</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="text-[0.46rem] font-medium text-white"
            >
              {["Excellent", "Full set", "2019"][i]}
            </motion.span>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-md bg-mint py-1.5 text-center text-[0.5rem] font-bold text-brand-deep">Continue</div>
    </ScreenChrome>
  );
}

export function ValuationScreen() {
  return (
    <ScreenChrome>
      <div className="flex flex-col items-center pt-2 text-center">
        <p className="text-[0.44rem] uppercase tracking-[0.2em] text-white/45">Estimated value</p>
        <p className="tabular mt-1 text-[1.15rem] font-bold text-white">
          <CountUp to={8400} />
        </p>
        <div className="mt-3 flex h-10 w-full items-end gap-1">
          {[40, 55, 48, 70, 62, 88].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
              className="flex-1 rounded-sm bg-mint/60"
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-1">
          <TrendingUp className="h-2.5 w-2.5 text-mint" strokeWidth={2.5} />
          <span className="text-[0.44rem] text-white/60">Above market average</span>
        </div>
      </div>
    </ScreenChrome>
  );
}

export function PaidScreen() {
  return (
    <ScreenChrome>
      <div className="flex flex-col items-center pt-3 text-center">
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="flex items-center gap-1 rounded-full bg-white/[0.08] px-2 py-1"
        >
          <ShieldCheck className="h-2.5 w-2.5 text-mint" strokeWidth={2.5} />
          <span className="text-[0.44rem] font-semibold text-white">Authenticated</span>
        </motion.div>
        <p className="mt-3 text-[0.44rem] uppercase tracking-[0.2em] text-white/45">Payout sent</p>
        <p className="tabular mt-1 text-[1.15rem] font-bold text-mint">
          <CountUp to={9200} />
        </p>
        <div className="mt-3 flex w-full items-center justify-between rounded-lg bg-white/[0.06] px-2 py-1.5">
          <span className="text-[0.42rem] text-white/40">Valued at {gbp(8400)}</span>
          <span className="text-[0.42rem] font-semibold text-mint">You got more</span>
        </div>
      </div>
    </ScreenChrome>
  );
}
