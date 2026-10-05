"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect } from "react";
import { isPreorder, type Product } from "@/data/products";
import { preorder } from "@/config/site";
import { copy } from "@/content/copy";
import { usePieceTransition } from "@/components/transition/PieceTransition";
import { PLATE_SIZES } from "@/lib/stage";
import { ease } from "@/lib/motion";

/**
 * The piece, presented — the first view of every product page. The bracelet
 * sits exactly where the opening transition leaves it (.plate-stage), so
 * arriving here is one continuous movement.
 */
export function PieceStage({ product: p }: { product: Product }) {
  const { arrived } = usePieceTransition();
  useEffect(() => {
    // wait one frame so the page has painted underneath the veil
    const f = requestAnimationFrame(() => requestAnimationFrame(() => arrived(p.slug)));
    return () => cancelAnimationFrame(f);
  }, [arrived, p.slug]);

  return (
    <section aria-label={p.name} data-theme="light" className="relative h-[100svh] min-h-[560px] overflow-hidden stage grain">
      <div aria-hidden className="absolute -inset-[12%] light-beams anim-beams" />
      <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(55% 50% at 50% 52%, ${p.tone.wash}, transparent 75%)` }} />

      <div className="plate-stage">
        <Image src={p.media.plate.src} alt={p.media.plate.alt} fill sizes={PLATE_SIZES} quality={90} priority className="object-contain" />
      </div>

      <div className="absolute inset-x-0 top-[calc(var(--nav-h)+5svh)] md:top-[calc(var(--nav-h)+4svh)] text-center px-6">
        <motion.p
          className="t-eyebrow tabular-nums"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        >
          {p.index} — Collection 01
        </motion.p>
        {isPreorder(p) && (
          <motion.p className="mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.2 }}>
            <span className="badge-preorder">{preorder.label} open</span>
          </motion.p>
        )}
        <motion.h1
          className="t-name text-[clamp(1.6rem,3.4vw,3.2rem)] mt-4"
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.34em" }}
          transition={{ duration: 1.8, ease: ease.lux, delay: 0.6 }}
        >
          {p.name}
        </motion.h1>
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-[5svh] text-center px-6 flex flex-col items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: ease.lux, delay: 1 }}
      >
        <p className="t-subtitle">{p.expression}</p>
        {isPreorder(p) ? (
          <a href="#reserve" className="btn-solid mt-6">
            {preorder.label} — {preorder.cta}
          </a>
        ) : (
          <p className="t-eyebrow mt-6 flex flex-col items-center gap-4">
            {copy.productPage.scroll}
            <span aria-hidden className="relative block h-9 w-px bg-[var(--c-line)] overflow-hidden">
              <span className="absolute inset-0 bg-[var(--c-strong)] anim-scroll-cue" />
            </span>
          </p>
        )}
      </motion.div>
    </section>
  );
}
