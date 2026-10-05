import { business, contactHref, site } from "@/config/site";

export type LegalSection = { id: string; title: string; body: (string | string[])[] };

/** A calm, readable long-form page for Privacy and Terms. */
export function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  return (
    <article className="bg-paper">
      <header className="relative stage grain pt-[calc(var(--nav-h)+10vh)] pb-[7vh] overflow-hidden">
        <div className="shell-narrow relative">
          <p className="t-eyebrow">{eyebrow}</p>
          <h1 className="t-display mt-4">{title}</h1>
          <p className="t-body mt-6 max-w-[60ch]">{intro}</p>
          <p className="text-[0.875rem] text-faint mt-4">Last updated {business.policiesUpdated}</p>
        </div>
      </header>
      <div className="shell-narrow py-[clamp(3rem,8vh,5rem)] grid md:grid-cols-[13rem_1fr] gap-10">
        <nav aria-label="Sections" className="hidden md:block">
          <ol className="sticky top-[calc(var(--nav-h)+2rem)] space-y-2 text-[0.92rem]">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-muted hover:text-[var(--c-strong)] transition-colors">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="space-y-12">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-[calc(var(--nav-h)+2rem)]">
              <h2 className="t-subtitle">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-4 space-y-4 text-[0.97rem] leading-[1.75] text-[var(--c-text-muted)]">
                {s.body.map((b, j) =>
                  Array.isArray(b) ? (
                    <ul key={j} className="list-disc pl-5 space-y-2">
                      {b.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j}>{b}</p>
                  )
                )}
              </div>
            </section>
          ))}
          <p className="text-[0.97rem] text-muted border-t border-line pt-8">
            Questions about this page?{" "}
            <a href={contactHref("Privacy and terms")} className="underline underline-offset-4 text-[var(--c-strong)]">
              Contact {site.brand}
            </a>
            .
          </p>
        </div>
      </div>
    </article>
  );
}

/** "OZARA" or "OZARA (OZARA Ltd, registered address …)". */
export function whoWeAre() {
  const parts = [business.legalName, business.registration ? `registration ${business.registration}` : null, business.address].filter(Boolean);
  return parts.length ? `${site.brand} (${parts.join(", ")})` : site.brand;
}
