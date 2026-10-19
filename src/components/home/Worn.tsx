"use client";

import Link from "next/link";
import { products, productHref } from "@/data/products";
import { copy } from "@/content/copy";
import { Photo } from "@/components/ui/Photo";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { RevealText } from "@/components/ui/RevealText";
import { Reveal } from "@/components/ui/Reveal";

/** The two, at different heights, like prints pinned to a wall. */

export function Worn() {
  const c = copy.worn;
  const offsets = ["lg:mt-[14vh]", ""];
  return (
    <section aria-label={c.eyebrow} className="relative bg-paper section-pad overflow-hidden">
      <div className="shell">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-5">
            <Reveal className="t-eyebrow mb-6">{c.eyebrow}</Reveal>
            <RevealText lines={c.headline} className="t-display" />
          </div>
        </div>
        <ul className="mt-16 grid grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-12 lg:gap-x-8">
          {products.map((p, i) => {
            const image = p.media.portrait;
            return (
            <li key={p.id} className={`${["lg:col-span-4 lg:col-start-2", "lg:col-span-5 lg:col-start-7"][i]} ${offsets[i]}`}>
              <Link href={productHref(p)} className="group block">
                <MaskReveal className="relative aspect-[4/5]" delay={i * 0.12} duration={1.6}>
                  <Photo image={image} parallax={7} className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.03]" sizes="(min-width:1024px) 28vw, 50vw" />
                </MaskReveal>
                <p className="t-name text-[0.85rem] mt-5">{p.name}</p>
                <p className="t-eyebrow !text-[12px] mt-2">{p.finish} plating</p>
              </Link>
            </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
