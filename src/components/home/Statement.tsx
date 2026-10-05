"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { copy } from "@/content/copy";
import { EyeMark } from "@/components/brand/Emblem";
import { Reveal } from "@/components/ui/Reveal";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { Photo } from "@/components/ui/Photo";
import { collectionMedia } from "@/data/media";

/** Wear: the piece. Tap: the Eye. Unlock: the stones. */
const STEP_IMAGES = [collectionMedia.wave.portrait, collectionMedia.flow.eyeMacro, collectionMedia.line.stonePortraits.sapphire!];
import { useReducedMotion } from "@/lib/hooks";

/**
 * WHAT IS OZARA — one sentence, read at the pace of the scroll (each word
 * comes into focus as you reach it), then the whole idea in three words:
 * Wear → Tap → Unlock.
 */
export function Statement() {
  const c = copy.statement;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 82%", "end 48%"] });
  const words = c.text.split(" ");

  return (
    <section aria-label={c.eyebrow} className="relative bg-paper pt-[clamp(6rem,18vh,12rem)] pb-[clamp(5rem,14vh,9rem)]">
      <div className="shell-narrow text-center">
        <EyeMark className="w-9 mx-auto text-[var(--c-strong)]" />
        <p className="t-eyebrow mt-6">{c.eyebrow}</p>
        <div ref={ref} className="mt-10">
          <p className="t-statement" aria-label={c.text}>
            {words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1.6) / words.length]} still={reduce}>
                {w}
              </Word>
            ))}
          </p>
        </div>

        {/* Wear → Tap → Unlock, each shown: the piece, the Eye, the stones */}
        <ol className="mt-[clamp(3.5rem,9vh,6rem)] grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10 items-start">
          {c.steps.map((s, i) => (
            <li key={s.title} className={`grid grid-cols-[6.5rem_1fr] gap-5 items-center text-left sm:block sm:text-center ${i === 1 ? "sm:mt-16" : ""}`}>
              <MaskReveal className="relative aspect-[4/5] w-full" delay={i * 0.12} duration={1.5}>
                <Photo image={STEP_IMAGES[i]} className="absolute inset-0" sizes="(min-width:640px) 28vw, 26vw" />
              </MaskReveal>
              <Reveal index={i} className="sm:mt-6">
                <p className="t-eyebrow tabular-nums flex items-center gap-3 sm:justify-center">
                  0{i + 1}
                  <StepRule />
                </p>
                <p className="t-subtitle mt-2">{s.title}</p>
                <p className="t-small mt-2 max-w-[24ch] sm:mx-auto">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Word({ children, progress, range, still }: { children: string; progress: MotionValue<number>; range: [number, number]; still: boolean }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const blur = useTransform(progress, range, ["blur(3px)", "blur(0px)"]);
  return (
    <motion.span aria-hidden className="inline-block mr-[0.26em]" style={still ? undefined : { opacity, filter: blur }}>
      {children}
    </motion.span>
  );
}

/** A hairline ending in the emblem's star — the same mark as the site's links. */
function StepRule() {
  return (
    <span aria-hidden className="relative inline-block w-10 h-[9px] text-[var(--c-strong)]">
      <span className="absolute left-0 right-[12px] top-1/2 h-px bg-current opacity-40" />
      <span className="absolute right-0 top-0 size-[9px] bg-[var(--c-burgundy)] [mask:var(--star-mark)_center/contain_no-repeat]" />
    </span>
  );
}
