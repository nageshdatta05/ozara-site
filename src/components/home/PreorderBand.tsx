import Link from "next/link";
import { preorder } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";

/** Directly under the opening: pre-order, stated plainly and quietly. */
export function PreorderBand() {
  return (
    <section aria-label={preorder.label} data-theme="dark" className="relative bg-burgundy theme-dark">
      <div className="shell py-7 md:py-8 grid md:grid-cols-[auto_1fr_auto] items-center gap-5 md:gap-10">
        <Reveal>
          <span className="badge-preorder">{preorder.label}</span>
        </Reveal>
        <Reveal index={1}>
          <p className="text-[1.1rem] text-[var(--c-strong)]">
            <span className="font-display text-[1.15rem] mr-2">{preorder.headline}</span>
            <span className="text-muted">{preorder.why}</span>
          </p>
        </Reveal>
        <Reveal index={2}>
          <Link href="/shop" className="link-quiet whitespace-nowrap">
            {preorder.cta}
            <span className="rule" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
