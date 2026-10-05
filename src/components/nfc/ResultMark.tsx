"use client";

import { motion } from "motion/react";

/** The single glanceable symbol: ✓ authentic · — no longer valid · ? not recognised. */
export function ResultMark({ kind, className = "", tone = "dark" }: { kind: "ok" | "revoked" | "unknown" | "fail"; className?: string; tone?: "light" | "dark" }) {
  const palette = tone === "light" ? { ok: "#2c4a7e", bad: "#9b3446", unknown: "#8a6a2c" } : { ok: "#b8cff5", bad: "#e7a3ad", unknown: "#d9c79b" };
  const stroke = kind === "ok" ? palette.ok : kind === "revoked" || kind === "fail" ? palette.bad : palette.unknown;
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden>
      <motion.circle
        cx="60"
        cy="60"
        r="56"
        stroke={stroke}
        strokeOpacity="0.45"
        strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.circle
        cx="60"
        cy="60"
        r="44"
        stroke={stroke}
        strokeWidth="1.2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1], delay: 0.1 }}
      />
      {kind === "ok" && (
        <motion.path d="M42 61 L55 74 L80 47" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} />
      )}
      {(kind === "revoked") && (
        <motion.path d="M42 60 H78" stroke={stroke} strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.6 }} />
      )}
      {kind === "fail" && (
        <motion.path d="M46 46 L74 74 M74 46 L46 74" stroke={stroke} strokeWidth="3" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6 }} />
      )}
      {kind === "unknown" && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }}>
          <path d="M51 50c0-5 4-9 9-9s9 4 9 9c0 6-9 7-9 13" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="76" r="2.2" fill={stroke} />
        </motion.g>
      )}
    </svg>
  );
}
