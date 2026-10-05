"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useRef } from "react";
import { isPreorder, productHref, priceLabel, type Product } from "@/data/products";
import { preorder } from "@/config/site";
import { usePieceTransition } from "@/components/transition/PieceTransition";
import { PLATE_SIZES } from "@/lib/stage";
import { ease } from "@/lib/motion";

/** The collection: each piece on its own length of stone, alternating sides. */
export function CollectionIndex({ items }: { items: Product[] }) {
  return (
    <ol>
      {items.map((p, i) => (
        <Row key={p.id} p={p} flip={i % 2 === 1} />
      ))}
    </ol>
  );
}

function Row({ p, flip }: { p: Product; flip: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { present } = usePieceTransition();
  const open = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    present(p, { rect: ref.current?.querySelector("img")?.getBoundingClientRect() });
  };
  return (
    <li className="relative stage grain overflow-hidden border-t border-[rgb(29_26_23/0.06)]">
      <div aria-hidden className="absolute inset-0" style={{ background: `radial-gradient(45% 60% at ${flip ? 70 : 30}% 50%, ${p.tone.wash}, transparent 75%)` }} />
      <div className="shell relative grid md:grid-cols-12 items-center gap-y-6 py-[clamp(3rem,9vh,6rem)]">
        <motion.div
          className={`md:col-span-7 ${flip ? "md:order-2 md:col-start-6" : ""}`}
          initial={{ opacity: 0, x: flip ? 40 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.6, ease: ease.lux }}
        >
          <Link ref={ref} href={productHref(p)} onClick={open} className="group block" aria-label={`${p.name} — ${p.expression}`}>
            <Image
              src={p.media.plate.src}
              alt={p.media.plate.alt}
              width={p.media.plate.width}
              height={p.media.plate.height}
              sizes={PLATE_SIZES}
              quality={90}
              className="w-full h-auto transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:-translate-y-2 group-hover:scale-[1.02]"
            />
          </Link>
        </motion.div>
        <div className={`md:col-span-4 ${flip ? "md:order-1 md:col-start-1" : "md:col-start-9"}`}>
          <p className="t-eyebrow tabular-nums">{p.index} — {p.finish}</p>
          <h2 className="t-name text-[clamp(1.3rem,2.2vw,2rem)] mt-4">{p.name}</h2>
          <p className="t-subtitle mt-4 !text-[var(--c-text-muted)]">{p.expression}</p>
          <p className="t-body mt-5 max-w-[34ch]">{p.form}</p>
          <p className="mt-6 flex items-center gap-4">
            {isPreorder(p) && <span className="badge-preorder">{preorder.label}</span>}
            <span className="text-[0.92rem] text-muted">{priceLabel(p)}</span>
          </p>
          <Link href={productHref(p)} onClick={open} className="link-quiet mt-9">
            {isPreorder(p) ? `${preorder.cta} — ${p.name}` : `Discover ${p.name}`}
            <span className="rule" aria-hidden />
          </Link>
        </div>
      </div>
    </li>
  );
}
