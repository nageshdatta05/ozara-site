import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { products } from "@/data/products";
import { preorder, site } from "@/config/site";
import { RevealText } from "@/components/ui/RevealText";
import { Reveal } from "@/components/ui/Reveal";
import { Emblem, Wordmark } from "@/components/brand/Emblem";
import { CollectionIndex } from "@/components/product/CollectionIndex";

export const metadata: Metadata = {
  title: "Collection",
  description: "The Wave, the Flow and the Line — three OZARA bracelets, each with the OZARA eye and a digital identity of its own. Open for pre-order.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  const c = copy.shop;
  return (
    <>
      <section className="relative bg-paper overflow-hidden pt-[calc(var(--nav-h)+10vh)] pb-[9vh]">
        {/* the print of the house: a faint impression, cropped by the page… */}
        <div aria-hidden className="absolute -left-[14vw] top-1/2 -translate-y-1/2 w-[min(50vw,680px)] text-[var(--c-strong)] opacity-[0.06] pointer-events-none">
          <Emblem className="w-full" strokeWidth={0.6} />
        </div>
        <div className="shell relative grid lg:grid-cols-12 gap-10 items-center">
          {/* …and the mark itself, set like a printed lock-up */}
          <div className="lg:col-span-3 hidden lg:flex flex-col items-center text-center gap-5 text-[var(--c-strong)]">
            <Emblem className="w-32" strokeWidth={0.8} />
            <Wordmark className="h-[1.9rem] mt-2" />
            <p className="t-eyebrow">The eye · The wave · The few</p>
          </div>
          <div className="lg:col-span-7 lg:col-start-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <Reveal className="flex items-center gap-4">
              <span className="t-eyebrow">{c.eyebrow}</span>
              <span className="badge-preorder">{preorder.label}</span>
            </Reveal>
            <RevealText as="h1" lines={c.headline} className="t-display mt-5" />
            <Reveal index={2} className="t-body mt-6 max-w-[44ch]">
              <p>{c.body}</p>
              <p className="mt-3 text-[0.97rem]">{preorder.why}</p>
            </Reveal>
          </div>
        </div>
      </section>
      <CollectionIndex items={products} />
    </>
  );
}
