import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Banknote, Check, CheckCircle2, MousePointer2, Pause, Play, Sparkles, Store } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const FRAME_MS = 4200;
const CLICK_AT_MS = 1600;

function ListFrame({ clicked }: { clicked: boolean }) {
  return (
    <div className="flex h-full items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-sm">
        <p className="text-[0.6rem] uppercase tracking-[0.24em] text-white/40">New competition</p>
        <div className="mt-3 flex items-center gap-3 border border-white/10 bg-white/[0.04] p-3">
          <img src="/watches/rolex-datejust-126234-sunburst.jpg" alt="" className="h-12 w-12 object-cover" />
          <div>
            <p className="text-[0.82rem] font-medium text-white">Rolex Datejust 126234</p>
            <p className="text-[0.68rem] text-white/45">Watches</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { l: "Ticket", v: "£5.00" },
            { l: "Entries", v: "2,000" },
            { l: "Deadline", v: "14 days" },
          ].map((f) => (
            <div key={f.l} className="border border-white/10 bg-white/[0.03] p-2.5 text-center">
              <p className="text-[0.56rem] uppercase tracking-[0.16em] text-white/40">{f.l}</p>
              <p className="tabular mt-1 text-[0.82rem] font-semibold text-white">{f.v}</p>
            </div>
          ))}
        </div>
        <motion.div
          animate={{ scale: clicked ? [1, 0.96, 1] : 1 }}
          transition={{ duration: 0.25 }}
          className={`mt-4 flex items-center justify-center gap-1.5 py-2.5 text-center text-[0.78rem] font-bold transition-colors duration-300 ${
            clicked ? "bg-mint text-brand-deep" : "bg-amber-400 text-[#241a0c]"
          }`}
        >
          {clicked ? (
            <>
              <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
              Published
            </>
          ) : (
            "Publish"
          )}
        </motion.div>
      </div>
    </div>
  );
}

function LiveFrame({ clicked }: { clicked: boolean }) {
  return (
    <div className="flex h-full items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-sm border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 bg-mint px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-brand-deep">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-brand-deep" />
            Live
          </span>
          <p className="tabular text-[0.7rem] text-white/50">1,480 / 2,000 entries</p>
        </div>
        <img src="/watches/rolex-datejust-126234-sunburst.jpg" alt="" className="mt-3 aspect-video w-full object-cover" />
        <div className="relative mt-3 h-1.5 overflow-hidden bg-white/10">
          <motion.div
            className="h-full bg-amber-400"
            initial={{ width: "20%" }}
            animate={{ width: "74%" }}
            transition={{ duration: 3.2, ease: "easeOut" }}
          />
          <AnimatePresence>
            {clicked && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-7 left-[74%] -translate-x-1/2 whitespace-nowrap bg-black px-2 py-1 text-[0.62rem] font-semibold text-mint"
              >
                +18 today
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-2 text-[0.7rem] text-white/55">Selling steadily since it went live 6 days ago.</p>
      </div>
    </div>
  );
}

function MarketingFrame({ clicked }: { clicked: boolean }) {
  return (
    <div className="flex h-full items-center justify-center p-6 sm:p-10">
      <div className="flex w-full max-w-sm items-center gap-4">
        <div className="relative w-32 shrink-0 overflow-hidden bg-[#0a0a0a]">
          <img
            src="/watches/rolex-datejust-126234-sunburst.jpg"
            alt=""
            className="aspect-square w-full object-cover opacity-90 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />
          <div className="absolute inset-0 bg-amber-500/10" />
          <p className="absolute bottom-2 left-2 right-2 text-[0.62rem] font-bold text-white">Own it for £5.</p>
        </div>
        <div>
          <span
            className={`flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-wide transition-colors duration-300 ${
              clicked ? "text-mint" : "text-amber-300"
            }`}
          >
            {clicked ? <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> : <Sparkles className="h-3.5 w-3.5 animate-pulse" strokeWidth={2.4} />}
            {clicked ? "Ready to post" : "Generating"}
          </span>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-white/70">
            From your photo to a ready-to-post Instagram creative — captions, hashtags and all.
          </p>
        </div>
      </div>
    </div>
  );
}

function PaidFrame({ clicked }: { clicked: boolean }) {
  return (
    <div className="flex h-full items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-sm border border-white/10 bg-white/[0.03] p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-mint" strokeWidth={1.8} />
        <p className="mt-3 text-[0.62rem] uppercase tracking-[0.24em] text-white/45">Winner confirmed</p>
        <p className="tabular mt-1 text-[1.7rem] font-bold text-white">£10,000.00</p>
        <p className="mt-1 text-[0.7rem] text-white/55">Ready in your balance — 2,000 entries at £5.00</p>
        <AnimatePresence>
          {clicked && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] font-semibold text-mint"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
              Payout requested
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// `cursor` is where the pointer glides to for this frame, as a percentage of
// the whole 16:9 player — lined up with whatever this frame's clickable
// element is — and `clickAt` is how long (ms into the frame) it waits
// before "clicking" it and flipping the frame's `clicked` state.
const FRAMES = [
  { label: "List it", Icon: Store, Screen: ListFrame, cursor: { x: 50, y: 76 } },
  { label: "Goes live", Icon: Sparkles, Screen: LiveFrame, cursor: { x: 74, y: 63 } },
  { label: "We market it", Icon: Sparkles, Screen: MarketingFrame, cursor: { x: 62, y: 45 } },
  { label: "Get paid", Icon: Banknote, Screen: PaidFrame, cursor: { x: 50, y: 62 } },
];

/** A fake pointer that glides to and "clicks" whatever this frame's action is — the thing that actually sells "someone is really using this," not just frames appearing and disappearing. */
function Cursor({ x, y, clickTick }: { x: number; y: number; clickTick: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      animate={{ left: `${x}%`, top: `${y}%` }}
      initial={false}
      transition={{ type: "spring", stiffness: 80, damping: 15, mass: 0.6 }}
      style={{ marginLeft: "-3px", marginTop: "-3px" }}
    >
      <MousePointer2
        className="h-5 w-5 fill-white text-white"
        strokeWidth={1.5}
        style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.7))" }}
      />
      <AnimatePresence>
        {clickTick > 0 && (
          <motion.span
            key={clickTick}
            initial={{ scale: 0.3, opacity: 0.85 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute -left-2.5 -top-1.5 h-7 w-7 rounded-full border-2 border-amber-300"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * A "video" of the seller dashboard without an actual video file to host —
 * there's no real produced footage to draw from. Rather than frames just
 * crossfading in and out like a slideshow, a simulated cursor glides to and
 * clicks whatever each frame's action is (publish, watch it sell, generate
 * an ad, get paid), and each frame reacts to that click with a real state
 * change — the same "someone is actually driving this" trick a real screen
 * recording earns for free.
 */
export function SellerDashboardReel() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [clickTick, setClickTick] = useState(0);

  useEffect(() => {
    setClicked(false);
  }, [index]);

  useEffect(() => {
    if (!playing) return;
    const clickId = window.setTimeout(() => {
      setClicked(true);
      setClickTick((t) => t + 1);
    }, CLICK_AT_MS);
    const advanceId = window.setTimeout(() => setIndex((i) => (i + 1) % FRAMES.length), FRAME_MS);
    return () => {
      window.clearTimeout(clickId);
      window.clearTimeout(advanceId);
    };
  }, [index, playing]);

  const frame = FRAMES[index]!;
  const Screen = frame.Screen;
  const CurrentIcon = frame.Icon;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <Reveal className="mx-auto max-w-xl text-center">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.32em] text-amber-300">See it in action</p>
        <p className="mt-4 text-[1.7rem] font-bold leading-[1.1] tracking-[-0.015em] text-white sm:text-[2.1rem]">
          List, sell, market and get paid — all in one dashboard.
        </p>
        <p className="mt-3 text-[0.85rem] text-white/50">Two clicks in, and it's already selling itself.</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 overflow-hidden border border-white/10 bg-black">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="ml-3 text-[0.68rem] text-white/35">Seller dashboard</span>
        </div>

        <div className="relative aspect-video w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Screen clicked={clicked} />
            </motion.div>
          </AnimatePresence>
          <Cursor x={frame.cursor.x} y={frame.cursor.y} clickTick={clickTick} />
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 bg-white/[0.02] px-4 py-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-7 w-7 shrink-0 items-center justify-center text-white/70 hover:text-white"
          >
            {playing ? <Pause className="h-3.5 w-3.5" strokeWidth={2.2} /> : <Play className="h-3.5 w-3.5" strokeWidth={2.2} />}
          </button>
          <div className="flex flex-1 items-center gap-1.5">
            {FRAMES.map((f, i) => (
              <div key={f.label} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                {i === index && (
                  <motion.div
                    key={`${index}-${playing}`}
                    className="h-full bg-amber-400"
                    initial={{ width: i < index ? "100%" : "0%" }}
                    animate={{ width: playing ? "100%" : "0%" }}
                    transition={{ duration: playing ? FRAME_MS / 1000 : 0, ease: "linear" }}
                  />
                )}
                {i < index && <div className="h-full w-full bg-amber-400" />}
              </div>
            ))}
          </div>
          <p className="hidden shrink-0 items-center gap-1.5 text-[0.68rem] text-white/45 sm:flex">
            <CurrentIcon className="h-3.5 w-3.5 text-amber-300" strokeWidth={2.2} />
            {frame.label}
          </p>
        </div>
      </Reveal>
    </div>
  );
}
