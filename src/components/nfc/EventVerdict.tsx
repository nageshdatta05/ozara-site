"use client";

import { motion } from "motion/react";
import { ResultMark } from "./ResultMark";

export type Verdict = {
  valid: boolean;
  authentic: boolean;
  eligible: boolean;
  reason: "ok" | "not_eligible" | "suspended" | "revoked" | "not_recognized";
  event: { name: string };
  braceletId: string | null;
};

const COPY = {
  ok: { title: "Valid", line: "Authentic bracelet", access: "Eligible", bg: "#123d2b", accent: "#8fd1ae" },
  not_eligible: { title: "Not eligible", line: "Authentic bracelet", access: "Not on this event's list", bg: "#4a3510", accent: "#e8c77c" },
  suspended: { title: "Not verified", line: "This bracelet has been reported lost.", access: "No access — ask for ID", bg: "#4a1520", accent: "#f0a7b2" },
  revoked: { title: "Not verified", line: "This bracelet is no longer valid.", access: "No access", bg: "#4a1520", accent: "#f0a7b2" },
  not_recognized: { title: "Not verified", line: "This bracelet could not be verified.", access: "No access", bg: "#4a1520", accent: "#f0a7b2" },
} as const;

/** Door result — readable from arm's length: colour, symbol, one word. */
export function EventVerdict({ v, onDone }: { v: Verdict; onDone?: () => void }) {
  const c = COPY[v.reason];
  return (
    <motion.button
      type="button"
      onClick={onDone}
      aria-live="assertive"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-6"
      style={{ background: c.bg, color: "#f3f4f7" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <ResultMark kind={v.valid ? "ok" : v.reason === "not_eligible" ? "fail" : "fail"} className="w-36 sm:w-44" />
      <p className="mt-6 font-[family-name:var(--font-sans)] font-semibold uppercase tracking-[0.14em] text-[clamp(2.4rem,11vw,4.5rem)] leading-none" style={{ color: c.accent }}>
        {c.title}
      </p>
      <p className="mt-5 text-[1.15rem] opacity-90">{c.line}</p>
      <dl className="mt-10 grid gap-4 text-left w-full max-w-sm">
        <Row k="Event" v={v.event.name} />
        {v.braceletId && <Row k="Bracelet" v={v.braceletId} mono />}
        <Row k="Access" v={c.access} strong accent={c.accent} />
      </dl>
      <p className="mt-12 text-[0.875rem] uppercase tracking-[0.2em] opacity-60">Tap anywhere for the next bracelet</p>
    </motion.button>
  );
}

function Row({ k, v, mono, strong, accent }: { k: string; v: string; mono?: boolean; strong?: boolean; accent?: string }) {
  return (
    <div className="flex justify-between gap-6 border-t border-white/15 pt-3">
      <dt className="text-[0.82rem] uppercase tracking-[0.18em] opacity-60">{k}</dt>
      <dd className={`${mono ? "tabular-nums tracking-[0.12em]" : ""} ${strong ? "font-semibold uppercase tracking-[0.1em]" : ""}`} style={strong ? { color: accent } : undefined}>
        {v}
      </dd>
    </div>
  );
}
