import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";

// A gentle, even loop — no big spin. Keeping the rotation range small means
// the phone always sits at a flattering angle that shows the screen and one
// rail cleanly, instead of ever swinging edge-on or round to the back.
const ROTATE_Y = [-16, -9, -16];
const ROTATE_X = [7, 4, 7];
const ROTATE_Z = [-1.5, 1, -1.5];
const TRANSLATE_Y = [0, -12, 0];
const TRANSLATE_X = [0, 5, 0];
// A small push/pull on the depth axis on top of the tilt — still reads as
// occupying real 3D space without needing a dramatic spin to sell it.
const SCALE = [1, 1.025, 1];

const SHADOW_SCALE = [1, 0.9, 1];
const SHADOW_OPACITY = [0.42, 0.3, 0.42];

const CHASSIS_GRADIENT =
  "linear-gradient(155deg, #4a4a4e 0%, #17181b 28%, #0a0a0b 55%, #333438 78%, #0a0a0b 100%)";
const BACK_GRADIENT = "linear-gradient(160deg, #3a3b3f 0%, #101113 45%, #0a0a0b 100%)";
// Brushed-metal rail, banded so it catches light like a real anodised edge
// rather than reading as a flat grey strip.
const RAIL_GRADIENT =
  "linear-gradient(90deg, #131316 0%, #6a6b6f 18%, #d9dadc 42%, #8d8e92 58%, #2c2d30 82%, #131316 100%)";
// How thick the phone reads as, in px — real depth, not just a flat card.
const DEPTH = 20;

/**
 * A photorealistic 3D iPhone frame — a real screen face, a titanium back
 * panel, and brushed-metal side rails, not just a flat card with a rotation
 * on it — floating above a real ground shadow and its own faded reflection,
 * in front of a glassy "bubble" of glow. It sways gently and continuously
 * within a small angle range (no big spin — that's what made the rails and
 * back panel show their seams) plus a scroll-linked parallax tilt, so it
 * always sits at a flattering angle rather than ever swinging edge-on.
 */
export function PhoneMockup({
  children,
  glow = "var(--color-mint)",
  glow2 = "var(--color-brand)",
  floatDelay = 0,
}: {
  children: ReactNode;
  glow?: string;
  glow2?: string;
  floatDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const parallaxRotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);
  // Same scroll parallax as the phone itself (not a separate, smaller range)
  // so the bubble tracks it while scrolling instead of drifting apart.
  const bubbleParallaxY = parallaxY;

  const phoneMotion = {
    initial: { rotateY: ROTATE_Y[0], rotateX: ROTATE_X[0], rotateZ: ROTATE_Z[0], y: 0, x: 0, scale: 1 },
    animate: { rotateY: ROTATE_Y, rotateX: ROTATE_X, rotateZ: ROTATE_Z, y: TRANSLATE_Y, x: TRANSLATE_X, scale: SCALE },
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay: floatDelay },
  };

  return (
    <div ref={ref} className="relative mx-auto" style={{ perspective: 1000 }}>
      {/* The bubble — a big, liquid, shape-shifting blob (not a fixed circle): an
          ambient halo and a glassy sphere on top of it, each lurching through a
          long run of irregular border-radius shapes and off-centre positions at
          uneven pace, like a soap bubble actually deforming as it drifts, rather
          than a smooth, predictable, in-place breathing glow. */}
      <motion.div
        aria-hidden
        style={{ y: bubbleParallaxY }}
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 blur-[70px]"
          style={{ background: glow }}
          animate={{
            scale: [1, 1.3, 0.86, 1.2, 0.94, 1.12, 1],
            rotate: [0, 24, -14, 32, -8, 10, 0],
            opacity: [0.16, 0.3, 0.19, 0.28, 0.17, 0.25, 0.16],
            x: [0, 16, -12, 10, -8, 5, 0],
            y: [0, -14, 11, -8, 9, -4, 0],
            borderRadius: [
              "42% 58% 65% 35% / 45% 45% 55% 55%",
              "66% 34% 40% 60% / 55% 68% 32% 45%",
              "35% 65% 58% 42% / 65% 30% 70% 35%",
              "58% 42% 30% 70% / 40% 60% 40% 60%",
              "48% 52% 70% 30% / 62% 45% 55% 38%",
              "60% 40% 45% 55% / 35% 55% 45% 65%",
              "42% 58% 65% 35% / 45% 45% 55% 55%",
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            times: [0, 0.16, 0.32, 0.48, 0.64, 0.82, 1],
            ease: ["easeInOut", "easeIn", "easeOut", "easeInOut", "easeOut", "easeInOut"],
            delay: floatDelay,
          }}
        />
        <motion.div
          className="glow-ring absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: `radial-gradient(circle at 32% 26%, oklch(1 0 0 / 80%), ${glow} 22%, ${glow2} 55%, transparent 78%)`,
            boxShadow: `inset -14px -14px 44px oklch(0 0 0 / 30%), inset 12px 12px 30px oklch(1 0 0 / 28%), 0 0 70px -8px ${glow}`,
          }}
          animate={{
            scale: [1, 1.18, 0.84, 1.14, 0.92, 1.08, 1],
            rotate: [0, -18, 26, -30, 12, -6, 0],
            x: [0, 11, -9, 7, -6, 3, 0],
            y: [0, -10, 8, -6, 7, -3, 0],
            opacity: [0.5, 0.66, 0.4, 0.6, 0.44, 0.58, 0.5],
            borderRadius: [
              "48% 52% 58% 42% / 42% 48% 52% 58%",
              "64% 36% 42% 58% / 58% 64% 36% 42%",
              "38% 62% 62% 38% / 66% 34% 66% 34%",
              "55% 45% 34% 66% / 40% 58% 42% 60%",
              "45% 55% 68% 32% / 60% 42% 58% 40%",
              "58% 42% 46% 54% / 36% 56% 44% 64%",
              "48% 52% 58% 42% / 42% 48% 52% 58%",
            ],
          }}
          transition={{
            duration: 12.5,
            repeat: Infinity,
            times: [0, 0.14, 0.3, 0.46, 0.63, 0.8, 1],
            ease: ["easeInOut", "easeIn", "easeOut", "easeInOut", "easeOut", "easeInOut"],
            delay: floatDelay + 0.4,
          }}
        />
      </motion.div>

      {/* Ground shadow, anchored beneath the phone */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 h-6 w-32 -translate-x-1/2 rounded-full bg-black blur-md sm:w-36"
        animate={{ scaleX: SHADOW_SCALE, opacity: SHADOW_OPACITY }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
      />

      <motion.div style={{ y: parallaxY, rotate: parallaxRotate }} className="relative z-[2]">
        <motion.div
          {...phoneMotion}
          style={{ transformStyle: "preserve-3d" }}
          className="relative mx-auto w-[13.5rem] sm:w-[15rem]"
        >
          {/* Front face — the screen itself. Sits at the box's z=0 face; hidden
              once it rotates past the point where its back would show, so it
              never renders a mirrored screen. */}
          <div
            className="relative rounded-[2.6rem] p-[3px]"
            style={{
              background: CHASSIS_GRADIENT,
              boxShadow:
                "0 40px 70px -25px rgba(0,0,0,0.75), 0 8px 18px -8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.25)",
              backfaceVisibility: "hidden",
            }}
          >
            <div
              className="relative overflow-hidden rounded-[2.35rem] bg-black"
              style={{ aspectRatio: "9 / 19.5", boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.9)" }}
            >
              {/* Screen content */}
              <div className="absolute inset-0 overflow-hidden bg-[var(--color-surface)]">{children}</div>

              {/* Glass glare sweeping across the screen */}
              <div
                className="pointer-events-none absolute inset-0 z-[5]"
                style={{
                  background:
                    "linear-gradient(115deg, rgba(255,255,255,0.14) 0%, transparent 24%, transparent 76%, rgba(255,255,255,0.05) 100%)",
                }}
              />

              {/* Dynamic island */}
              <div className="absolute left-1/2 top-2 z-[6] h-[1.15rem] w-16 -translate-x-1/2 rounded-full bg-black" />
            </div>
          </div>

          {/* Back — a plain titanium panel, real depth behind the screen so the
              big spin doesn't ever flash empty space once it swings past 180°. */}
          <div
            className="absolute inset-0 rounded-[2.6rem]"
            style={{
              background: BACK_GRADIENT,
              transform: `rotateY(180deg) translateZ(${DEPTH}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            <div className="absolute left-5 top-6 h-14 w-14 rounded-[1.2rem] bg-black/50" />
          </div>

          {/* Right rail — a real edge, not a flat 2D hint: a brushed-metal strip
              hinged at the front face's own right edge and swung back into the
              z-axis, so it's actually visible as the phone turns. Inset top/bottom
              by the chassis's own corner radius so it only spans the straight run
              of the side, not the rounded corners — a flat-topped rectangle here
              pokes out past the curve like an exposed rod otherwise. */}
          <div
            className="absolute right-0 rounded-full"
            style={{
              top: "2.6rem",
              bottom: "2.6rem",
              width: DEPTH,
              background: RAIL_GRADIENT,
              transformOrigin: "right center",
              transform: "rotateY(90deg)",
            }}
          >
            <div className="absolute left-1/2 top-1/2 h-10 w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-black/35" />
          </div>
          {/* Left rail */}
          <div
            className="absolute left-0 rounded-full"
            style={{
              top: "2.6rem",
              bottom: "2.6rem",
              width: DEPTH,
              background: RAIL_GRADIENT,
              transformOrigin: "left center",
              transform: "rotateY(-90deg)",
            }}
          >
            <div className="absolute left-1/2 top-[30%] h-6 w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-black/35" />
            <div className="absolute left-1/2 top-1/2 h-10 w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-black/35" />
          </div>
        </motion.div>

        {/* Reflection — same motion, mirrored and faded beneath it, so the phone
            reads as an object occupying real space rather than a flat cutout */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-full mx-auto w-[13.5rem] opacity-[0.16] sm:w-[15rem]"
          style={{
            transform: "scaleY(-1)",
            maskImage: "linear-gradient(to bottom, black, transparent 72%)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent 72%)",
          }}
        >
          <motion.div {...phoneMotion} style={{ transformStyle: "preserve-3d" }} className="relative mx-auto w-full">
            <div className="rounded-[2.6rem]" style={{ aspectRatio: "9 / 19.5", background: CHASSIS_GRADIENT }} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
