import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/content/copy";
import { collectionMedia } from "@/data/media";
import { Emblem, EyeMark } from "@/components/brand/Emblem";
import { Photo } from "@/components/ui/Photo";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { Proof } from "@/components/sections/Proof";
import { Makers } from "@/components/sections/Makers";

export const metadata: Metadata = {
  title: "About",
  description: "OZARA — jewellery meets technology. Three bracelets that share one sign: the eye.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const c = copy.about;
  const [eye, wave, few, first] = c.sections;
  return (
    <>
      <section className="relative stage grain overflow-hidden pt-[calc(var(--nav-h)+14vh)] pb-[14vh]">
        <div aria-hidden className="absolute -inset-[12%] light-beams anim-beams" />
        <div className="shell-narrow relative text-center flex flex-col items-center">
          <Reveal className="t-eyebrow">{c.eyebrow}</Reveal>
          <RevealText as="h1" lines={c.headline} className="t-display mt-5" />
          <Reveal index={2} className="t-body mt-8 max-w-[46ch]">
            <p>{c.intro}</p>
          </Reveal>
        </div>
      </section>

      {/* emblem → eye */}
      <section className="relative bg-paper section-pad">
        <div className="shell grid lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-5 flex items-center justify-center gap-[6vw] text-[var(--c-strong)]">
            <Emblem className="w-[34%] max-w-[180px]" strokeWidth={0.9} />
            {/* a hairline that ends in the emblem's star — the link mark, drawn large */}
            <svg aria-hidden viewBox="0 0 120 30" className="w-[clamp(4.5rem,8vw,7.5rem)] shrink-0 overflow-visible">
              <line x1="0" y1="15" x2="92" y2="15" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <path d="M106 1Q107.6 13.4 120 15Q107.6 16.6 106 29Q104.4 16.6 92 15Q104.4 13.4 106 1Z" fill="var(--c-burgundy)" />
            </svg>
            <EyeMark className="w-[46%] max-w-[240px]" strokeWidth={0.9} />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal className="t-eyebrow">{eye.title}</Reveal>
            <Reveal index={1} className="t-statement !text-[clamp(1.4rem,2.2vw,2rem)] mt-5">
              <p>{eye.body}</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative bg-linen section-pad overflow-hidden">
        <div className="shell grid lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-6 grid grid-cols-3 gap-3">
            {(["wave", "flow", "line"] as const).map((k, i) => (
              <MaskReveal key={k} className={`relative aspect-[480/452] ${i === 1 ? "mt-10" : ""}`} delay={i * 0.1}>
                <Photo image={collectionMedia[k].curveMacro} className="absolute inset-0" sizes="16vw" />
              </MaskReveal>
            ))}
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal className="t-eyebrow">{wave.title}</Reveal>
            <Reveal index={1} className="t-body mt-5 max-w-[42ch]">
              <p>{wave.body}</p>
            </Reveal>
            <Reveal index={2} className="t-eyebrow mt-12">{few.title}</Reveal>
            <Reveal index={3} className="t-body mt-5 max-w-[42ch]">
              <p>{few.body}</p>
            </Reveal>
            <Reveal index={4} className="t-eyebrow mt-12">{first.title}</Reveal>
            <Reveal index={5} className="t-body mt-5 max-w-[42ch]">
              <p>{first.body}</p>
            </Reveal>
            <Reveal index={4} className="mt-10 flex flex-wrap gap-10">
              <Link href="/shop" className="link-quiet">
                The collection
                <span className="rule" aria-hidden />
              </Link>
              <Link href="/technology" className="link-quiet">
                The technology
                <span className="rule" aria-hidden />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <Makers />
      <Proof />
    </>
  );
}
