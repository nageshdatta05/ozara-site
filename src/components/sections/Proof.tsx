import { founder, proof } from "@/config/site";

/**
 * Social proof — press and client words, and a founder's note. The single
 * biggest trust lever for a new brand. Renders only real, configured content;
 * in development, empty slots show where it goes.
 */
export function Proof() {
  const hasPress = proof.press.length > 0;
  const hasWords = proof.testimonials.length > 0;

  // Nothing is shown until real, attributable press, client words or a founder's note exist (src/config/site.ts).
  if (!hasPress && !hasWords && !founder) return null;

  return (
    <section aria-label="What people say" className="relative bg-paper section-pad">
      <div className="shell">
        {hasPress && (
          <ul className="flex flex-wrap items-baseline justify-center gap-x-14 gap-y-8 text-center">
            {proof.press.map((q) => (
              <li key={q.outlet} className="max-w-[28ch]">
                <p className="font-display text-[1.2rem] leading-snug">“{q.quote}”</p>
                <p className="t-eyebrow mt-3">{q.outlet}</p>
              </li>
            ))}
          </ul>
        )}
        {hasWords && (
          <ul className={`grid md:grid-cols-3 gap-10 ${hasPress ? "mt-20" : ""}`}>
            {proof.testimonials.map((t) => (
              <li key={t.name}>
                <p className="t-body !text-[var(--c-strong)]">“{t.quote}”</p>
                <p className="t-eyebrow mt-4">{t.name}</p>
              </li>
            ))}
          </ul>
        )}
        {founder && (
          <figure className={`max-w-[46rem] mx-auto text-center ${hasPress || hasWords ? "mt-24" : ""}`}>
            <blockquote className="font-display text-[clamp(1.4rem,2.4vw,2.1rem)] leading-snug">“{founder.quote}”</blockquote>
            <figcaption className="t-eyebrow mt-6">
              {founder.name} · {founder.role}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
