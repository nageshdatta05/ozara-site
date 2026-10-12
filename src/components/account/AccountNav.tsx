import Link from "next/link";

/** Account sections: one calm row that fits on a phone. */
export function AccountNav({ current }: { current: "orders" | "bracelets" | "card" | "settings" }) {
  const items = [
    ["card", "/account/card", "Your card"],
    ["bracelets", "/account/bracelets", "Bracelets"],
    ["orders", "/account", "Orders"],
    ["settings", "/account/settings", "Settings"],
  ] as const;
  return (
    <nav aria-label="Account" className="mt-8 -mx-1 flex items-center gap-x-4 sm:gap-x-6 overflow-x-auto whitespace-nowrap px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map(([k, href, label]) => (
        <Link key={k} href={href} className="btn-text shrink-0 max-sm:!text-[10.5px] max-sm:!tracking-[0.13em]" aria-current={current === k ? "page" : undefined}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
