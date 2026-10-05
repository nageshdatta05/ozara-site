import type { Metadata } from "next";
import Link from "next/link";
import { faqGroups } from "@/content/faq";
import { site } from "@/config/site";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { EyeMark } from "@/components/brand/Emblem";

export const metadata: Metadata = {
  title: "Questions",
  description: "OZARA — the eye, the wave, NFC authentication, ownership, gemstone customisation, sizing, pre-orders, delivery and support.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <section className="relative stage grain overflow-hidden pt-[calc(var(--nav-h)+12vh)] pb-[10vh]">
        <div aria-hidden className="absolute -inset-[12%] light-beams anim-beams" />
        <div className="shell relative">
          <Reveal className="t-eyebrow flex items-center gap-3">
            <EyeMark className="w-6 text-[var(--c-strong)]" />
            Questions
          </Reveal>
          <RevealText as="h1" lines={["Questions,", "*answered.*"]} className="t-display mt-5" />
          <nav aria-label="Topics" className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {faqGroups.map((g) => (
              <a key={g.key} href={`#${g.key}`} className="btn-text">
                {g.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="relative bg-paper section-pad">
        <div className="shell space-y-20">
          {faqGroups.map((g) => (
            <div key={g.key} id={g.key} className="grid lg:grid-cols-12 gap-8 scroll-mt-[calc(var(--nav-h)+2rem)]">
              <div className="lg:col-span-4">
                <Reveal className="t-eyebrow !text-[var(--c-burgundy)]">{g.title}</Reveal>
              </div>
              <div className="lg:col-span-7 lg:col-start-6">
                <Accordion items={g.items} large />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative bg-linen py-[clamp(4rem,10vh,6rem)]">
        <div className="shell flex flex-col md:flex-row md:items-center justify-between gap-6">
          <p className="t-subtitle">Something else? We read every message.</p>
          <div className="flex gap-8">
            <Link href="/contact" className="link-quiet">
              Write to us
              <span className="rule" aria-hidden />
            </Link>
            <Link href="/account" className="link-quiet">
              Your account
              <span className="rule" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
