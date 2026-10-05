"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { copy } from "@/content/copy";
import { collectionMedia } from "@/data/media";
import { EyeMark } from "@/components/brand/Emblem";
import { Photo } from "@/components/ui/Photo";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { Reveal } from "@/components/ui/Reveal";
import { ease } from "@/lib/motion";

/**
 * The three ideas behind the house — the Eye, the Wave, the Few — drawn
 * along one line that waves across the page.
 */
export function Signature() {
  const c = copy.signature;
  const images = [collectionMedia.flow.eyeMacro, collectionMedia.wave.curveMacro, collectionMedia.line.stonePhotos.amethyst![2]];
  return (
    <section aria-label={c.eyebrow} className="relative bg-linen section-pad overflow-hidden">
      <div className="shell">
        <Reveal className="t-eyebrow text-center">{c.eyebrow}</Reveal>
        <Reveal index={1}>
          <h2 className="t-title text-center mt-5 max-w-[22ch] mx-auto">{c.headline}</h2>
        </Reveal>

        {/* the wave: one line, drawn as you arrive */}
        <svg viewBox="0 0 1200 80" className="w-full h-[56px] md:h-[80px] mt-12 text-[var(--c-burgundy)] overflow-visible" aria-hidden preserveAspectRatio="none">
          <motion.path
            d="M0 40 C 100 8, 200 8, 300 40 S 500 72, 600 40 S 800 8, 900 40 S 1100 72, 1200 40"
            fill="none"
            stroke="currentColor"
            strokeWidth={0.9}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0.2 }}
            whileInView={{ pathLength: 1, opacity: 0.55 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 2.4, ease: ease.silk }}
          />
        </svg>

        <ol className="grid md:grid-cols-3 gap-14 md:gap-10 mt-6">
          {c.ideas.map((idea, i) => (
            <li key={idea.title} className={i === 1 ? "md:mt-16" : ""}>
              <MaskReveal className="relative aspect-[480/452] w-[62%] md:w-[56%]" delay={i * 0.12}>
                <Photo image={images[i]} className="absolute inset-0" sizes="(min-width:768px) 18vw, 60vw" />
              </MaskReveal>
              <Reveal index={i} className="mt-7">
                <p className="t-eyebrow !text-[var(--c-burgundy)] flex items-center gap-3">
                  {i === 0 && <EyeMark className="w-5 text-[var(--c-burgundy)]" />}
                  0{i + 1} — {idea.kicker}
                </p>
                <h3 className="t-subtitle mt-3">{idea.title}</h3>
                <p className="t-body mt-3 max-w-[34ch]">{idea.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-14 text-center">
          <Link href="/about" className="link-quiet">
            {c.link}
            <span className="rule" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
