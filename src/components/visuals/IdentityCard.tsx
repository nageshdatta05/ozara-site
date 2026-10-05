"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { site } from "@/config/site";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { ease } from "@/lib/motion";
import { Guilloche } from "./Guilloche";
import { Wordmark } from "@/components/brand/Emblem";

export type CardField = { label: string; value: string };
export type CardFace = {
  key: string;
  /** Small overline at the top right of the card, e.g. "Member". */
  kicker: string;
  /** The large line — a name, a piece, a pass. */
  title: { label: string; value: string };
  /** The line under the title, set in spaced figures. */
  code: string;
  fields: CardField[];
  /** Optional mark drawn at the right of the card. */
  mark?: "hallmark" | "tap" | "pass";
};

/**
 * A card in pale brushed metal with several faces — the piece's record,
 * ownership, access. It turns (a quarter-flip) between faces, tilts toward
 * the pointer and catches the light. Blue appears only where data does.
 * Every value is illustrative.
 */
export function IdentityCard({ face, className = "" }: { face: CardFace; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const s = { stiffness: 60, damping: 16, mass: 0.9 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-10, 10]), s);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), s);
  const lx = useSpring(useTransform(px, [-0.5, 0.5], [0, 100]), s);
  const ly = useSpring(useTransform(py, [-0.5, 0.5], [0, 100]), s);
  const sheen = useTransform(
    [lx, ly],
    ([x, y]: number[]) =>
      `radial-gradient(60% 80% at ${x}% ${y}%, rgb(255 252 245 / 0.75), transparent 60%), linear-gradient(${105 + (x - 50) * 0.6}deg, transparent 35%, rgb(255 255 255 / 0.35) 48%, transparent 60%)`
  );
  const live = fine && !reduce;

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ perspective: 1400 }}
      onPointerMove={(e) => {
        if (!live || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      <motion.div
        className="relative w-full aspect-[1.586]"
        style={{ rotateX: live ? rotateX : 0, rotateY: live ? rotateY : 0, transformStyle: "preserve-3d" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={face.key}
            className="absolute inset-0 rounded-[14px] overflow-hidden brushed-metal"
            style={{
              boxShadow: "0 60px 90px -55px rgb(60 44 30 / 0.55), 0 2px 6px rgb(60 44 30 / 0.12), inset 0 0 0 1px rgb(255 255 255 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.9)",
              backfaceVisibility: "hidden",
            }}
            initial={reduce ? { opacity: 0 } : { rotateY: 90, opacity: 0.6 }}
            animate={reduce ? { opacity: 1 } : { rotateY: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { rotateY: -90, opacity: 0.6 }}
            transition={{ duration: 0.45, ease: ease.silk }}
          >
            <Guilloche className="absolute -right-[18%] -top-[40%] w-[80%] opacity-60" stroke="#8a7967" rings={18} petals={16} strokeOpacity={0.3} />
            <motion.div aria-hidden className="absolute inset-0 mix-blend-soft-light" style={{ background: sheen }} />
            <Face face={face} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Face({ face }: { face: CardFace }) {
  const tiny = "t-eyebrow !text-[clamp(6px,0.6vw,9px)] !text-[#1d1a17]/50";
  return (
    <div className="relative h-full flex flex-col p-[6.5%] text-[#1d1a17]">
      <div className="flex items-start justify-between">
        <Wordmark className="h-[clamp(0.85rem,1.4vw,1.2rem)]" />
        <p className="t-eyebrow !text-[clamp(7px,0.7vw,10px)] !text-[#1d1a17]/60">{face.kicker}</p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className={tiny}>{face.title.label}</p>
          <p className="font-display text-[clamp(1.15rem,2.4vw,2.1rem)] leading-tight mt-1 truncate">{face.title.value}</p>
          <p className="tabular-nums tracking-[0.3em] text-[clamp(0.58rem,0.95vw,0.82rem)] text-[#1d1a17]/60 mt-2">{face.code}</p>
        </div>
        {face.mark && <Mark kind={face.mark} />}
      </div>

      <div className="mt-[6%] grid grid-cols-3 gap-4 border-t border-[#1d1a17]/12 pt-[4%]">
        {face.fields.map((f) => (
          <div key={f.label} className="min-w-0">
            <p className={tiny}>{f.label}</p>
            <p className="text-[clamp(0.58rem,0.92vw,0.8rem)] text-[#1d1a17]/85 mt-1 truncate">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Small engraved marks — kept abstract and quiet. */
function Mark({ kind }: { kind: NonNullable<CardFace["mark"]> }) {
  const wrap = (children: ReactNode) => (
    <div aria-hidden className="relative shrink-0 w-[18%] aspect-square text-[#1d1a17]">
      {children}
    </div>
  );
  if (kind === "hallmark")
    return wrap(
      <svg viewBox="0 0 60 60" className="size-full" fill="none" stroke="currentColor">
        <circle cx="30" cy="30" r="28" strokeOpacity="0.35" strokeWidth="0.8" />
        <circle cx="30" cy="30" r="20" strokeOpacity="0.55" strokeWidth="0.8" />
        <path d="M22 30.5l5.5 5.5L39 24" stroke="#2c4a7e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (kind === "tap")
    return wrap(
      <svg viewBox="0 0 60 60" className="size-full" fill="none" stroke="currentColor">
        {[8, 15, 22, 29].map((r, i) => (
          <circle key={r} cx="30" cy="30" r={r} strokeOpacity={0.6 - i * 0.13} strokeWidth="0.8" />
        ))}
        <circle cx="30" cy="30" r="2" fill="#2c4a7e" stroke="none" />
      </svg>
    );
  return wrap(
    <svg viewBox="0 0 60 60" className="size-full" fill="none" stroke="currentColor">
      <rect x="10" y="4" width="40" height="52" rx="3" strokeOpacity="0.5" strokeWidth="0.8" />
      <path d="M10 38h40" strokeOpacity="0.45" strokeDasharray="2 2" strokeWidth="0.8" />
      <circle cx="30" cy="21" r="6" strokeOpacity="0.7" strokeWidth="0.8" />
    </svg>
  );
}
