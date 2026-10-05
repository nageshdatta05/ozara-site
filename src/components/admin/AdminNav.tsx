"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { href: "/admin/nfc", label: "Overview" },
  { href: "/admin/nfc/bracelets", label: "Bracelets" },
  { href: "/admin/nfc/bracelets/new", label: "Register" },
  { href: "/admin/nfc/events", label: "Events" },
  { href: "/admin/nfc/orders", label: "Orders" },
  { href: "/admin/nfc/messages", label: "Messages" },
];

export function AdminNav() {
  const path = usePathname();
  const active = (href: string) =>
    href === "/admin/nfc" ? path === href : href === "/admin/nfc/bracelets" ? path.startsWith(href) && !path.endsWith("/new") : path.startsWith(href);
  return (
    <nav aria-label="Admin" className="shell flex gap-7 overflow-x-auto">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={active(t.href) ? "page" : undefined}
          className="relative py-3 text-[0.8rem] uppercase tracking-[0.16em] whitespace-nowrap transition-colors"
          style={{ color: active(t.href) ? "var(--c-ink)" : "var(--c-ink-muted)" }}
        >
          {t.label}
          <span aria-hidden className="absolute left-0 right-0 bottom-0 h-px bg-[var(--c-ink)] transition-transform origin-left" style={{ transform: `scaleX(${active(t.href) ? 1 : 0})` }} />
        </Link>
      ))}
    </nav>
  );
}

export function SignOut() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn-text !text-[var(--c-ink-muted)]"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
