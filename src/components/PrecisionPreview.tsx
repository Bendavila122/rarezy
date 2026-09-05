import { useEffect, useRef, useState } from "react";

const SPEED = 140;
const ZONE_DEG = 26;

function norm(a: number) {
  return ((a % 360) + 360) % 360;
}

function angularDiff(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** A non-interactive, auto-looping preview of the precision mechanic — the hand keeps sweeping and briefly flashes each time it crosses the target zone, so a visitor can see the "stop it in the zone" idea before touching anything. */
export function PrecisionPreview() {
  const [target, setTarget] = useState(() => Math.random() * 360);
  const [hit, setHit] = useState(false);
  const [score, setScore] = useState(0);
  const handRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(Math.random() * 360);
  const lastTsRef = useRef<number | undefined>(undefined);
  const rafRef = useRef<number | undefined>(undefined);
  const targetRef = useRef(target);
  targetRef.current = target;
  const hitRef = useRef(false);

  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTsRef.current === undefined) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      angleRef.current = norm(angleRef.current + SPEED * dt);
      if (handRef.current) handRef.current.style.transform = `rotate(${angleRef.current}deg)`;

      if (!hitRef.current && angularDiff(angleRef.current, targetRef.current) < 4) {
        hitRef.current = true;
        setHit(true);
        setScore((s) => s + 1);
        window.setTimeout(() => {
          setTarget(Math.random() * 360);
          hitRef.current = false;
          setHit(false);
        }, 260);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="rounded-none border border-white/10 bg-white/[0.05] p-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/50">Watch it play</p>
        <p className="tabular text-[0.7rem] font-semibold text-white/50">
          Score <span className="text-white">{score}</span>
        </p>
      </div>
      <div className="relative mx-auto mt-3 h-40 w-40 rounded-full border border-white/10 bg-white/[0.04]">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from ${target - ZONE_DEG / 2}deg, oklch(0.82 0.19 148 / 35%) 0deg, oklch(0.82 0.19 148 / 35%) ${ZONE_DEG}deg, transparent ${ZONE_DEG}deg)`,
          }}
        />
        <div
          ref={handRef}
          className={`absolute left-1/2 bottom-1/2 h-[42%] w-[2.5px] rounded-full transition-colors ${hit ? "bg-white" : "bg-mint"}`}
          style={{ marginLeft: "-1.25px", transformOrigin: "50% 100%" }}
        />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint" />
      </div>
    </div>
  );
}
