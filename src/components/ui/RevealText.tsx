"use client";

import { motion } from "motion/react";
import { createElement, type ElementType } from "react";
import { parseEmphasis, plain, riseIn } from "@/lib/motion";

type Props = {
  lines: string[];
  as?: ElementType;
  className?: string;
  /** Delay (in stagger steps) before the first line rises. */
  offset?: number;
  /** Controlled mode — reveal when true instead of on scroll-into-view. */
  show?: boolean;
};

/**
 * Editorial headline: each line rises out of its own mask.
 * Screen readers get the plain sentence; the animated spans are hidden from them.
 * The in-view trigger sits on the unclipped wrapper — the masked lines
 * themselves are invisible to IntersectionObserver until they move.
 */
export function RevealText({ lines, as = "h2", className, offset = 0, show }: Props) {
  const controlled = show !== undefined;
  return createElement(
    as,
    { className, "aria-label": plain(lines) },
    <motion.span
      aria-hidden
      className="block"
      initial="hidden"
      {...(controlled
        ? { animate: show ? "show" : "hidden" }
        : { whileInView: "show", viewport: { once: true, margin: "0px 0px -10% 0px" } })}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.1em] -mb-[0.1em] pr-[0.12em] -mr-[0.12em]">
          <motion.span className="block will-change-transform" variants={riseIn} custom={i + offset}>
            {parseEmphasis(line).map((seg, j) =>
              seg.em ? <em key={j}>{seg.text}</em> : <span key={j}>{seg.text}</span>
            )}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
