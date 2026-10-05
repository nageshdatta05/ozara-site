import Link from "next/link";

/** Account sections. */
export function AccountNav({ current }: { current: "overview" | "bracelets" }) {
  const items = [
    ["overview", "/account", "Reservations & details"],
    ["bracelets", "/account/bracelets", "Bracelets"],
  ] as const;
  return (
    <nav aria-label="Account" className="mt-8 flex gap-8">
      {items.map(([k, href, label]) => (
        <Link key={k} href={href} className="btn-text" aria-current={current === k ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
