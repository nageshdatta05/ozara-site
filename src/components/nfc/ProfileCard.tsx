import type { PublicProfile } from "@/server/profiles";

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

/**
 * What an owner chose to share, shown after a tap. Everything here was
 * switched on by the owner; nothing else about them is ever on this page.
 */
export function ProfileCard({ p, braceletId }: { p: PublicProfile; braceletId: string }) {
  const enc = encodeURIComponent(braceletId);
  const links: { label: string; text: string; href: string; external?: boolean }[] = [];
  if (p.phone) links.push({ label: "Phone", text: p.phone, href: tel(p.phone) });
  if (p.email) links.push({ label: "Email", text: p.email, href: `mailto:${p.email}` });
  if (p.website) links.push({ label: "Website", text: host(p.website), href: p.website, external: true });
  if (p.instagram) links.push({ label: "Instagram", text: `@${p.instagram}`, href: `https://instagram.com/${p.instagram}`, external: true });
  if (p.linkedin) links.push({ label: "LinkedIn", text: "View profile", href: p.linkedin, external: true });
  const canSave = !!(p.name || p.phone || p.email);

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      {p.photo && (
        // eslint-disable-next-line @next/next/no-img-element -- a small private photo served by our own route
        <img src={`/b/${enc}/photo`} alt={p.name ? `Photo of ${p.name}` : ""} width={160} height={160} className="size-32 sm:size-36 rounded-full object-cover ring-1 ring-[var(--c-line)]" />
      )}
      {p.name && <h1 className="t-display !text-[clamp(2.1rem,9vw,3.1rem)] leading-tight mt-7">{p.name}</h1>}
      {p.headline && <p className="t-subtitle mt-3 max-w-[30ch]">{p.headline}</p>}

      {canSave && (
        <a href={`/b/${enc}/contact`} className="btn-solid mt-8">
          Save contact
        </a>
      )}

      {links.length > 0 && (
        <ul className="mt-9 w-full text-left">
          {links.map((l) => (
            <li key={l.label} className="border-t border-line last:border-b">
              <a
                href={l.href}
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="flex items-baseline justify-between gap-6 py-3.5 text-[var(--c-strong)] transition-colors hover:text-[var(--c-burgundy)]"
              >
                <span className="t-eyebrow !text-[12px]">{l.label}</span>
                <span className="text-right text-[1.02rem] break-all">{l.text}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
