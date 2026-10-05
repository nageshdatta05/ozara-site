import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/server/session";
import { Logo } from "@/components/brand/Emblem";
import { AdminNav, SignOut } from "@/components/admin/AdminNav";

export const metadata: Metadata = { title: "NFC Authentication — Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  return (
    <div data-theme="light" className="theme-light min-h-[100svh] bg-ivory text-[var(--c-ink)]">
      <header className="border-b border-[var(--c-ink-line)] bg-ivory/90 backdrop-blur sticky top-0 z-40">
        <div className="shell h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="text-[var(--c-ink)] text-[1.02rem]" aria-label="OZARA home">
              <Logo />
            </Link>
            <span aria-hidden className="h-5 w-px bg-[var(--c-ink-line)]" />
            <span className="t-eyebrow !text-[var(--c-ink)]">NFC Authentication</span>
          </div>
          {admin && <SignOut />}
        </div>
        {admin && <AdminNav />}
      </header>
      <main className="shell py-10 md:py-14">{children}</main>
    </div>
  );
}
