import Link from "next/link";

/** Account sections. */
export function AccountNav({ current }: { current: "overview" | "bracelets" | "card" }) {
  const items = [
    ["card", "/account/card", "Your card"],
    ["overview", "/account", "Reservations & details"],
    ["bracelets", "/account/bracelets", "Bracelets"],
  ] as const;
  return (
    <nav aria-label="Account" className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
      {items.map(([k, href, label]) => (
        <Link key={k} href={href} className="btn-text" aria-current={current === k ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
