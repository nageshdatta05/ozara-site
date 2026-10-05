"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { copy } from "@/content/copy";
import { products } from "@/data/products";
import { ease } from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { ConceptTag } from "@/components/ui/ConceptTag";
import { IdentityCard, type CardFace } from "@/components/visuals/IdentityCard";

const CYCLE_MS = 4200;

/**
 * UNDERSTAND → IDENTIFY → CONNECT.
 * A single line runs from the bracelet to what it opens; a point of light —
 * the star of the eye — travels along it. The card turns to show each stage.
 */
export function Identity() {
  const c = copy.identity;
  const featured = products[1];
  const faces = c.faces.map((f) => ({
    ...f,
    mark: f.mark as CardFace["mark"],
    title: { ...f.title, value: f.title.value === "__featured__" ? featured.name : f.title.value },
    fields: f.fields.map((x) => (x.value === "__featured__" ? { ...x, value: featured.name } : x)),
  }));

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!inView || touched || reduce) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % faces.length), CYCLE_MS);
    return () => clearTimeout(t);
  }, [inView, touched, reduce, active, faces.length]);

  const choose = (i: number) => {
    setTouched(true);
    setActive(i);
  };
  const stop = faces[active].stop;
  const n = c.journey.length - 1;

  return (
    <section ref={ref} id="identity" aria-label={c.eyebrow} className="relative bg-linen section-pad overflow-hidden">
      <div className="shell">
        {/* the journey */}
        <div className="relative mb-[clamp(3.5rem,9vh,6rem)]">
          <div className="absolute left-0 right-0 top-[5px] h-px bg-[var(--c-line-strong)]" aria-hidden />
          <motion.span
            aria-hidden
            className="absolute top-0 size-[11px] -ml-[5.5px]"
            initial={false}
            animate={{ left: `${(stop / n) * 100}%` }}
            transition={{ duration: 1.2, ease: ease.lux }}
          >
            <svg viewBox="0 0 20 20" className="size-full text-[var(--c-accent)]">
              <path d="M10 0 Q11 9 20 10 Q11 11 10 20 Q9 11 0 10 Q9 9 10 0Z" fill="currentColor" />
            </svg>
          </motion.span>
          <ol className="hidden md:grid grid-cols-5 pt-7">
            {c.journey.map((j, i) => (
              <li
                key={j}
                className={`t-eyebrow transition-colors duration-700 ${i === 0 ? "text-left" : i === n ? "text-right" : "text-center"}`}
                style={{ color: i <= stop ? "var(--c-strong)" : undefined }}
              >
                {j}
              </li>
            ))}
          </ol>
          {/* phones: the current stop only */}
          <p className="md:hidden pt-7 t-eyebrow !text-[var(--c-strong)] text-center" aria-live="polite">
            <span className="tabular-nums text-faint mr-2">0{stop + 1}/0{n + 1}</span>
            {c.journey[stop]}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-14 lg:gap-10 items-center">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 40, rotate: -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.4, ease: ease.lux }}
          >
            <IdentityCard face={faces[active]} className="max-w-[620px] mx-auto lg:mx-0" />
          </motion.div>

          <div className="lg:col-span-5">
            <Reveal className="t-eyebrow mb-6">{c.eyebrow}</Reveal>
            <RevealText lines={c.headline} className="t-title" />
            <Reveal index={2} className="t-body mt-6 max-w-[38ch]">
              <p>{c.body}</p>
            </Reveal>

            <div role="tablist" aria-label="Card faces" className="mt-10 border-t border-line">
              {faces.map((f, i) => {
                const on = i === active;
                return (
                  <button
                    key={f.key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => choose(i)}
                    onMouseEnter={() => choose(i)}
                    className="w-full text-left py-4 border-b border-line grid grid-cols-[2.5rem_1fr] items-baseline"
                  >
                    <span className="t-eyebrow tabular-nums transition-colors duration-500" style={{ color: on ? "var(--c-accent)" : undefined }}>
                      0{i + 1}
                    </span>
                    <span>
                      <span className="font-display text-[1.25rem] block transition-colors duration-500" style={{ color: on ? "var(--c-strong)" : "var(--c-text-faint)" }}>
                        {f.tab}
                      </span>
                      <motion.span
                        className="block overflow-hidden"
                        initial={false}
                        animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
                        transition={{ duration: 0.6, ease: ease.lux }}
                      >
                        <span className="block pt-1.5 text-[1rem] text-muted max-w-[36ch]">{f.line}</span>
                      </motion.span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
              <Link href="/technology" className="link-quiet">
                {c.link}
                <span className="rule" aria-hidden />
              </Link>
              {c.disclaimer && <ConceptTag>{c.disclaimer}</ConceptTag>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
