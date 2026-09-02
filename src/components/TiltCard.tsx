import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ReactNode } from "react";

/**
 * Wraps children in a spring-physics 3D tilt that follows the cursor — the
 * card leans away from the pointer like a pane of glass catching the light.
 * Pure CSS transforms driven by pointer position; nothing to load, nothing
 * to break on touch devices (tilt simply never engages without a mouse).
 */
export function TiltCard({
  children,
  className = "",
  max = 7,
  scale = 1.015,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
}) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 280, damping: 24, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };
  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      transition={{ scale: { type: "spring", stiffness: 280, damping: 22 } }}
      className={`group relative ${className}`}
    >
      {children}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) => `radial-gradient(220px circle at ${gx} ${gy}, oklch(1 0 0 / 22%), transparent 70%)`,
          ),
        }}
      />
    </motion.div>
  );
}
