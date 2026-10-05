"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { GEMS, type GemKey, type Product } from "@/data/products";
import type { ImageAsset } from "@/data/media";
import { copy } from "@/content/copy";
import { ease } from "@/lib/motion";
import { PurchasePanel } from "./PurchasePanel";

/**
 * The commercial heart of the page: the pictures on the left, one decision
 * on the right. Choosing a stone shows the piece photographed with it.
 */
export function PieceBuy({ product: p }: { product: Product }) {
  const m = p.media;
  const views: { key: string; label: string; image: ImageAsset }[] = [
    { key: "studio", label: "The piece", image: m.studio },
    { key: "eye", label: "The eye", image: m.eyeMacro },
    { key: "curve", label: "The band", image: m.curveMacro },
    { key: "hinge", label: "The hinge", image: m.hinge },
  ];
  const [view, setView] = useState(0);
  const [gem, setGemState] = useState<GemKey | null>(null);
  const [stoneView, setStoneView] = useState(0);
  // the chosen stone lives in the address (?stone=ruby), so a refresh or a shared link keeps it
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("stone");
    if (k && GEMS.some((g) => g.key === k)) setGemState(k as GemKey);
  }, []);
  const setGem = (g: GemKey | null) => {
    setGemState(g);
    setStoneView(0);
    const u = new URL(window.location.href);
    if (g) u.searchParams.set("stone", g);
    else u.searchParams.delete("stone");
    window.history.replaceState(window.history.state, "", u);
  };
  // choosing a stone shows the bracelet set with it: photographs where we have
  // them for this model, otherwise the illustrated preview
  const gemLabel = gem ? GEMS.find((g) => g.key === gem)!.name : "";
  const photos = gem ? m.stonePhotos[gem] : undefined;
  const stoneViews = photos?.map((image, i) => ({ key: `gem-${gem}-${i}`, label: `${p.name} with ${gemLabel}`, image }));
  // a stone not yet photographed on this model: the piece itself, said plainly
  const shown = stoneViews ? stoneViews[Math.min(stoneView, stoneViews.length - 1)] : gem ? { key: `gem-${gem}`, label: `${p.name} · ${gemLabel} — photograph to follow`, image: m.studio } : views[view];
  const thumbs = stoneViews ?? views;

  return (
    <section id="reserve" aria-label={`${p.name} — reserve`} className="relative bg-paper py-[clamp(4rem,10vh,7rem)] scroll-mt-[var(--nav-h)]">
      <div className="shell grid lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden bg-linen">
            <AnimatePresence initial={false}>
              <motion.div
                key={shown.key}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.03, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: ease.lux }}
              >
                {shown.image.width < 800 ? (
                  // small originals are shown as a mounted print, never stretched
                  <div className="absolute inset-0 flex items-center justify-center p-[8%]">
                    <div className="relative h-full shadow-[var(--shadow-float)]" style={{ aspectRatio: `${shown.image.width} / ${shown.image.height}`, maxHeight: shown.image.height }}>
                      <Image src={shown.image.src} alt={shown.image.alt} fill sizes="480px" quality={90} className="object-cover" />
                    </div>
                  </div>
                ) : (
                  <Image
                    src={shown.image.src}
                    alt={shown.image.alt}
                    fill
                    sizes="(min-width:1024px) 56vw, 100vw"
                    quality={88}
                    className="object-cover"
                    style={{ objectPosition: shown.image.position ?? "50% 50%" }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="t-eyebrow !text-[12px] mt-4" aria-live="polite">{shown.label}</p>

          <ul className="mt-6 grid grid-cols-6 gap-2" aria-label="Views">
            {thumbs.map((v, i) => {
              const on = stoneViews ? stoneView === i : !gem && view === i;
              return (
                <li key={v.key}>
                  <button
                    type="button"
                    aria-label={v.label}
                    aria-pressed={on}
                    onClick={() => {
                      if (stoneViews) return setStoneView(i);
                      setGem(null);
                      setView(i);
                    }}
                    className="relative block w-full aspect-square overflow-hidden"
                  >
                    <Image src={v.image.src} alt="" fill sizes="10vw" className="object-cover transition-transform duration-700 hover:scale-105" />
                    <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] transition-colors duration-500" style={{ background: on ? "var(--c-strong)" : "transparent" }} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
            <PurchasePanel product={p} gem={gem} onGem={setGem} customise={copy.productPage.customise} />
          </div>
        </div>
      </div>
    </section>
  );
}
