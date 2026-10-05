import { makers } from "@/config/site";
import { Reveal } from "@/components/ui/Reveal";
import { Slot } from "@/components/commerce/Slot";

/**
 * The makers — OZARA's manufacturing partners. Only what each partner
 * publishes about itself; links only where the official page is known.
 */
export function Makers({ compact = false }: { compact?: boolean }) {
  return (
    <section aria-label="The makers" className={`relative ${compact ? "bg-paper py-[clamp(3.5rem,9vh,6rem)]" : "bg-paper section-pad"}`}>
      <div className="shell grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <Reveal className="t-eyebrow">The makers</Reveal>
          <Reveal index={1}>
            <h2 className="t-title mt-5">Made with people who have spent lifetimes on stone and metal.</h2>
          </Reveal>
        </div>
        <ul className="lg:col-span-7 lg:col-start-6 border-t border-line">
          {makers.map((m, i) => (
            <li key={m.name} className="grid sm:grid-cols-[11rem_1fr] gap-2 sm:gap-8 py-7 border-b border-line">
              <Reveal index={i}>
                <p className="t-name text-[1.02rem]">{m.name}</p>
              </Reveal>
              <Reveal index={i + 1}>
                <p className="t-body">{m.line}</p>
                {m.url ? (
                  <a href={m.url} target="_blank" rel="noopener noreferrer" className="link-quiet mt-4">
                    Visit {m.source ?? m.name}
                    <span className="rule" aria-hidden />
                  </a>
                ) : (
                  <Slot className="mt-4 !py-3" name={`${m.name} link`} spec={`Official website for ${m.name} not yet provided — add it as \`url\` in makers (src/config/site.ts).`} />
                )}
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
