import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/content/copy";
import { media } from "@/data/media";
import { TheEye } from "@/components/home/TheEye";
import { Identity } from "@/components/home/Identity";
import { Photo } from "@/components/ui/Photo";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { ConceptTag } from "@/components/ui/ConceptTag";

export const metadata: Metadata = {
  title: "Technology",
  description: "How an OZARA bracelet carries a digital identity: the eye, the NFC tag, authentication, ownership and access.",
  alternates: { canonical: "/technology" },
};

export default function TechnologyPage() {
  const c = copy.technology;
  return (
    <>
      <section className="relative bg-paper pt-[calc(var(--nav-h)+12vh)] pb-[var(--space-section)]">
        <div className="shell grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-6">
            <Reveal className="t-eyebrow">{c.eyebrow}</Reveal>
            <RevealText as="h1" lines={c.headline} className="t-display mt-5" />
            <Reveal index={2} className="t-body mt-8 max-w-[44ch]">
              <p>{c.body}</p>
            </Reveal>
          </div>
          <div className="lg:col-span-6">
            <MaskReveal className="relative aspect-[1224/668]" duration={1.8}>
              <Photo image={media.nfcEye} zoom priority className="absolute inset-0" sizes="(min-width:1024px) 46vw, 100vw" />
            </MaskReveal>
          </div>
        </div>
      </section>

      <TheEye />

      {/* the chain, from object to access */}
      <section className="relative bg-linen section-pad">
        <div className="shell">
          <ol className="grid md:grid-cols-5 gap-10 md:gap-6">
            {c.chain.map((s, i) => (
              <li key={s.title} className="relative pt-8 border-t border-[var(--c-line-strong)]">
                <span aria-hidden className="absolute -top-[5px] left-0 size-[9px] rotate-45 border border-[var(--c-strong)] bg-linen" />
                <Reveal index={i}>
                  <p className="t-eyebrow tabular-nums !text-[var(--c-accent)]">0{i + 1}</p>
                  <p className="font-display text-[1.35rem] text-strong mt-3 leading-tight">{s.title}</p>
                  <p className="t-body mt-3 !text-[0.93rem]">{s.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Identity />

      <section className="relative bg-paper section-pad">
        <div className="shell-narrow">
          <Reveal className="t-eyebrow">Version one</Reveal>
          <RevealText lines={[c.honesty.title]} className="t-title mt-5" />
          <Reveal index={2} className="t-body mt-8">
            <p>{c.honesty.body}</p>
          </Reveal>
          <Reveal index={3} className="mt-10 flex flex-wrap gap-10">
            <Link href="/authenticity" className="link-quiet">
              Verify a bracelet
              <span className="rule" aria-hidden />
            </Link>
            <Link href="/shop" className="link-quiet">
              The collection
              <span className="rule" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
