"use client";

import Link from "next/link";
import { products, productHref, type Product } from "@/data/products";
import { copy } from "@/content/copy";
import { Photo } from "@/components/ui/Photo";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { Reveal } from "@/components/ui/Reveal";
import { usePieceTransition } from "@/components/transition/PieceTransition";

/**
 * EXPLORE — each piece gets its own composition rather than a card:
 * the Wave on linen, the Flow in the light.
 */
export function Expressions() {
  const [wave, flow] = products;
  return (
    <div id="collection" aria-label={copy.expressions.eyebrow}>
      <WaveChapter p={wave} />
      <OraChapter p={flow} />
    </div>
  );
}

function useOpen(p: Product) {
  const { present } = usePieceTransition();
  return (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    present(p, { point: { x: e.clientX, y: e.clientY } });
  };
}

function Title({ p, light = false }: { p: Product; light?: boolean }) {
  const open = useOpen(p);
  return (
    <div className={light ? "theme-dark" : ""}>
      <Reveal className="t-eyebrow tabular-nums">{p.index} — {p.finish}</Reveal>
      <Reveal index={1}>
        <h2 className="t-name text-[clamp(1.5rem,2.6vw,2.4rem)] mt-5">{p.name}</h2>
      </Reveal>
      <Reveal index={2}>
        <p className="t-subtitle mt-5 !text-[var(--c-text-muted)]">{p.expression}</p>
      </Reveal>
      <Reveal index={3}>
        <p className="t-body mt-6 max-w-[34ch]">{p.form}</p>
      </Reveal>
      <Reveal index={4}>
        <Link href={productHref(p)} onClick={open} className="link-quiet mt-10">
          {copy.expressions.discover} {p.name}
          <span className="rule" aria-hidden />
        </Link>
      </Reveal>
    </div>
  );
}

/* The Wave — wide studio frame, the eye in close-up laid over its corner. */
function WaveChapter({ p }: { p: Product }) {
  return (
    <section aria-label={p.name} className="relative bg-linen section-pad overflow-hidden">
      <div className="shell grid lg:grid-cols-12 gap-y-14 items-center">
        <div className="lg:col-span-7 relative">
          <MaskReveal className="relative aspect-[1224/756]" duration={1.8}>
            <Photo image={p.media.studio} zoom className="absolute inset-0" sizes="(min-width:1024px) 56vw, 100vw" />
          </MaskReveal>
          <div className="absolute -bottom-[12%] right-[6%] w-[30%] aspect-[480/452] shadow-[var(--shadow-float)]">
            <MaskReveal className="size-full" delay={0.35} duration={1.4}>
              <Photo image={p.media.eyeMacro} parallax={6} className="absolute inset-0" sizes="20vw" />
            </MaskReveal>
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-start-9 pt-10 lg:pt-0">
          <Title p={p} />
        </div>
      </div>
    </section>
  );
}

/* The Flow — text first, the piece upright, and the hinge as a quiet detail. */
function OraChapter({ p }: { p: Product }) {
  return (
    <section aria-label={p.name} className="relative bg-paper section-pad overflow-hidden">
      <div className="shell grid lg:grid-cols-12 gap-y-14 items-end">
        <div className="lg:col-span-4 order-2 lg:order-1 lg:pb-[8vh]">
          <Title p={p} />
        </div>
        <div className="lg:col-span-3 lg:col-start-6 order-3 lg:order-2 hidden lg:block self-start">
          <MaskReveal className="relative aspect-[1224/748]" delay={0.2}>
            <Photo image={p.media.hinge} parallax={10} className="absolute inset-0" sizes="22vw" />
          </MaskReveal>
          <p className="t-eyebrow !text-[12px] mt-4">The hinge</p>
        </div>
        <div className="lg:col-span-4 lg:col-start-9 order-1 lg:order-3">
          <MaskReveal className="relative aspect-[4/5]" duration={1.8}>
            <Photo image={p.media.portrait} parallax={6} zoom className="absolute inset-0" sizes="(min-width:1024px) 30vw, 100vw" />
          </MaskReveal>
        </div>
      </div>
    </section>
  );
}
