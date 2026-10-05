import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { copy } from "@/content/copy";
import { AVAILABILITY_LABEL, formatPrice, getProduct, getRelated, products } from "@/data/products";
import { PieceStage } from "@/components/product/PieceStage";
import { PieceBuy } from "@/components/product/PieceBuy";
import { RelatedPieces } from "@/components/product/RelatedPieces";
import { Photo } from "@/components/ui/Photo";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { Accordion } from "@/components/ui/Accordion";
import { ConceptTag } from "@/components/ui/ConceptTag";
import { EyeMark } from "@/components/brand/Emblem";
import { site } from "@/config/site";
import { allFaqs } from "@/content/faq";
import { Makers } from "@/components/sections/Makers";
import Link from "next/link";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.name} — ${p.expression} ${p.description}`,
    alternates: { canonical: `/shop/${p.slug}` },
    openGraph: { title: `${p.name} — ${site.brand}`, description: p.description, images: [{ url: p.media.hero.src, width: p.media.hero.width, height: p.media.hero.height, alt: p.media.hero.alt }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const c = copy.productPage;
  const m = p.media;

  // Only facts that exist.
  const details: [string, string][] = [
    ["Finish", p.finish],
    ["Signature", "The OZARA eye"],
    ["Form", p.form],
    ["Sizes", "S · M · L"],
    ["Technology", "NFC — tap to verify"],
    ...((p.specs ?? []).map((r) => [r.label, r.value]) as [string, string][]),
    ...(p.materials?.length ? [["Materials", p.materials.join(" · ")] as [string, string]] : []),
    ...(p.price ? [["Price", formatPrice(p.price)] as [string, string]] : []),
    ["Availability", AVAILABILITY_LABEL[p.availability]],
  ];
  const specsPending = !p.specs?.length && !p.materials?.length;
  const craft = [m.eyeMacro, m.hinge, m.curveMacro];

  // Structured data — a price is only stated once one is set.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${site.brand} ${p.name}`,
    description: `${p.expression} ${p.description}`,
    image: [`${site.url}${p.media.studio.src}`, `${site.url}${p.media.hero.src}`],
    brand: { "@type": "Brand", name: site.brand },
    color: p.finish,
    ...(p.price
      ? {
          offers: {
            "@type": "Offer",
            price: p.price.amount,
            priceCurrency: p.price.currency,
            availability: p.availability === "preorder" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
            url: `${site.url}/shop/${p.slug}`,
          },
        }
      : {}),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PieceStage product={p} />
      <PieceBuy product={p} />

      {/* ── Story: the campaign frame, and a few words ─────────────── */}
      <section className={`relative overflow-hidden section-pad ${p.tone.ink === "light" ? "bg-espresso theme-dark" : "bg-linen"}`} data-theme={p.tone.ink === "light" ? "dark" : "light"}>
        <div className="shell">
          <MaskReveal className="relative aspect-[16/9] lg:aspect-[21/9] lg:w-[86%] lg:ml-auto" duration={1.8}>
            <Photo image={m.hero} parallax={6} className="absolute inset-0" sizes="(min-width:1024px) 80vw, 100vw" />
            {p.tone.ink === "light" && <div aria-hidden className="absolute inset-0" style={{ boxShadow: "inset 0 0 120px 40px var(--c-espresso)" }} />}
          </MaskReveal>
          <div className="grid lg:grid-cols-12 gap-10 mt-14 lg:-mt-24 relative">
            <div className={`lg:col-span-5 lg:p-10 ${p.tone.ink === "light" ? "lg:bg-espresso" : "lg:bg-linen"}`}>
              <RevealText lines={[p.signoff]} className="t-title" />
              <div className="mt-8 space-y-5 max-w-[42ch]">
                {p.story.map((para, i) => (
                  <Reveal key={i} index={i + 1} className="t-body">
                    <p>{para}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The eye: the tap, explained in three words ───────────── */}
      <section className="relative bg-paper section-pad overflow-hidden">
        <div className="shell grid lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-6">
            <MaskReveal className="relative aspect-[1224/668]" duration={1.6}>
              <Photo image={m.nfcEye} zoom className="absolute inset-0" sizes="(min-width:1024px) 50vw, 100vw" />
            </MaskReveal>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal className="t-eyebrow mb-6 flex items-center gap-3">
              <EyeMark className="w-6 text-[var(--c-strong)]" />
              {c.eye.eyebrow}
            </Reveal>
            <RevealText lines={c.eye.headline} className="t-title" />
            <ol className="mt-10 border-t border-line">
              {c.eye.steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-2 py-5 border-b border-line">
                  <span className="t-eyebrow tabular-nums !text-[var(--c-accent)] pt-1">0{i + 1}</span>
                  <Reveal index={i}>
                    <p className="font-display text-[1.2rem] text-strong">{s.title}</p>
                    <p className="t-body mt-1">{s.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Details, close: three small prints ─────────────────── */}
      <section className="relative bg-linen section-pad">
        <div className="shell">
          <Reveal className="t-eyebrow mb-12">{c.craft.eyebrow}</Reveal>
          <ul className="grid grid-cols-3 gap-3 md:gap-8 lg:w-[78%] items-start">
            {craft.map((img, i) => (
              <li key={img.src} className={i === 1 ? "md:mt-16" : i === 2 ? "md:mt-6" : ""}>
                <MaskReveal className="relative aspect-[480/452]" delay={i * 0.12}>
                  <Photo image={img} className="absolute inset-0" sizes="(min-width:768px) 26vw, 33vw" />
                </MaskReveal>
                <p className="t-eyebrow !text-[11.5px] md:!text-[12px] mt-3 !normal-case !tracking-[0.04em] md:!text-[0.875rem]">{c.craft.lines[i]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The piece: facts only ──────────────────────────────── */}
      <section className="relative bg-paper section-pad">
        <div className="shell grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="t-eyebrow mb-6">{c.detailsEyebrow}</p>
            <h2 className="t-name text-[clamp(1.3rem,2vw,1.8rem)]">{p.name}</h2>
          </div>
          <dl className="lg:col-span-7 lg:col-start-6 border-t border-line">
            {details.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8.5rem_1fr] sm:grid-cols-[12rem_1fr] gap-4 py-5 border-b border-line">
                <dt className="t-eyebrow pt-[3px]">{k}</dt>
                <dd className="text-[1.02rem] text-strong">{v}</dd>
              </div>
            ))}
          </dl>
          {specsPending && (
            <p className="lg:col-span-7 lg:col-start-6 -mt-6 text-[0.97rem] text-muted">
              Full specifications published before launch.
            </p>
          )}
        </div>
      </section>

      {/* ── Questions ─────────────────────────────────────────── */}
      <section className="relative bg-linen section-pad">
        <div className="shell grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <Reveal className="t-eyebrow mb-6">{c.faqEyebrow}</Reveal>
            <RevealText lines={["Questions, *answered.*"]} className="t-title" />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <Accordion items={["Which gemstones are available?", "How does sizing work?", "What are pre-orders?", "How does NFC work?"].map((t) => allFaqs.find((f) => f.title === t)!)} large />
            <Link href="/faq" className="link-quiet mt-8">
              All questions
              <span className="rule" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <Makers compact />

      {/* ── The other expressions ─────────────────────────────── */}
      <section className="relative stage grain section-pad overflow-hidden">
        <div className="shell relative">
          <Reveal className="t-eyebrow text-center">{c.relatedEyebrow}</Reveal>
          <div className="mt-10 lg:w-[78%] mx-auto">
            <RelatedPieces items={getRelated(p.slug)} />
          </div>
        </div>
      </section>
    </article>
  );
}
