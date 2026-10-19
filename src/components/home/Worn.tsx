"use client";

import Link from "next/link";
import { products, productHref } from "@/data/products";
import { copy } from "@/content/copy";
import { Photo } from "@/components/ui/Photo";
import { media } from "@/data/media";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { RevealText } from "@/components/ui/RevealText";
import { Reveal } from "@/components/ui/Reveal";

/** The two together, in one photograph; each name opens its piece. */

export function Worn() {
  const c = copy.worn;
  return (
    <section aria-label={c.eyebrow} className="relative bg-paper section-pad overflow-hidden">
      <div className="shell">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-5">
            <Reveal className="t-eyebrow mb-6">{c.eyebrow}</Reveal>
            <RevealText lines={c.headline} className="t-display" />
          </div>
        </div>
        <Link href="/shop" className="group block mt-16">
          <MaskReveal className="relative aspect-[3/2] lg:aspect-[16/9]" duration={1.6}>
            <Photo image={media.pair} parallax={7} className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.02]" sizes="100vw" />
          </MaskReveal>
        </Link>
        <ul className="mt-8 grid grid-cols-2 gap-x-4">
          {products.map((p, i) => (
            <li key={p.id} className={i === 1 ? "text-right" : ""}>
              <Link href={productHref(p)} className="group inline-block">
                <p className="t-name text-[0.85rem]">{p.name}</p>
                <p className="t-eyebrow !text-[12px] mt-2">{p.finish} plating</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
