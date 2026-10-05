import Link from "next/link";
import { copy } from "@/content/copy";
import { collectionMedia } from "@/data/media";
import { Photo } from "@/components/ui/Photo";
import { MaskReveal } from "@/components/ui/MaskReveal";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";

/**
 * VALUE — what owning one gets you: the four moments at the door, and the two
 * kinds of OZARA event. Mirrors what the system does — bracelets registered to
 * an owner, eligibility set per event, checked by door staff with a tap.
 */
export function Access() {
  const c = copy.access;
  const eye = collectionMedia.line.stonePhotos.sapphire![1];
  return (
    <section aria-label={c.eyebrow} data-theme="dark" className="relative bg-espresso theme-dark section-pad overflow-hidden">
      <div className="shell">
        <div className="grid lg:grid-cols-12 gap-y-12 items-center">
          <div className="lg:col-span-5">
            <Reveal className="t-eyebrow mb-6">{c.eyebrow}</Reveal>
            <RevealText lines={c.headline} className="t-display" />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <MaskReveal className="relative aspect-[4/3]" duration={1.6}>
              <Photo image={eye} parallax={5} className="absolute inset-0" sizes="(min-width:1024px) 46vw, 100vw" />
              {/* let the marble fall away into the room */}
              <div aria-hidden className="absolute inset-0" style={{ boxShadow: "inset 0 0 90px 30px var(--c-espresso)" }} />
            </MaskReveal>
          </div>
        </div>

        {/* the four moments */}
        <ol className="mt-[clamp(3.5rem,9vh,6rem)] grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 border-t border-line pt-10">
          {c.flow.map((s, i) => (
            <li key={s.title}>
              <Reveal index={i}>
                <p className="t-eyebrow tabular-nums">0{i + 1}</p>
                <p className="t-subtitle mt-3">{s.title}</p>
                <p className="t-small mt-2 max-w-[26ch]">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        {/* the two kinds of event */}
        <div className="mt-[clamp(3rem,8vh,5rem)] grid md:grid-cols-2 gap-6">
          {c.tiers.map((t, i) => (
            <Reveal key={t.name} index={i} className="border border-line p-7 md:p-9">
              <p className="t-name text-[clamp(1rem,1.4vw,1.2rem)]">{t.name}</p>
              <p className="t-body mt-4 max-w-[38ch]">{t.body}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <Link href="/shop" className="link-quiet">
            Find your bracelet
            <span className="rule" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
