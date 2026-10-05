"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import { ease } from "@/lib/motion";

type Direction = "up" | "right" | "left";

const HIDDEN: Record<Direction, string> = {
  up: "inset(100% 0% 0% 0%)",
  right: "inset(0% 100% 0% 0%)",
  left: "inset(0% 0% 0% 100%)",
};

/**
 * Unmasks its content when scrolled into view. The observer watches an
 * unclipped wrapper — a fully clipped element never reports as visible.
 */
export function MaskReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 1.6,
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <div ref={ref} className={className}>
      <motion.div
        className="relative size-full overflow-hidden"
        initial={{ clipPath: HIDDEN[direction] }}
        animate={inView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
        transition={{ duration, ease: ease.lux, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
}
