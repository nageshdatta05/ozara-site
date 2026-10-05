import Link from "next/link";
import { Emblem, EyeMark, Wordmark } from "@/components/brand/Emblem";
import { site } from "@/config/site";

export const metadata = { title: "Page not found", robots: { index: false } };

/** Any address that doesn't exist. */
export default function NotFound() {
  return (
    <main className="relative min-h-[100svh] stage grain overflow-hidden flex flex-col">
      <header className="flex justify-center pt-8">
        <Link href="/" aria-label={`${site.brand} home`} className="flex items-center gap-2.5 text-[var(--c-strong)]">
          <Wordmark label={null} className="h-[1.5rem]" />
        </Link>
      </header>
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <EyeMark className="w-14 text-[var(--c-strong)]" open={0.12} />
        <p className="t-eyebrow mt-8">404</p>
        <h1 className="t-display mt-4">This page isn&rsquo;t here.</h1>
        <p className="t-body mt-5 max-w-[38ch]">The address may have changed, or the page may never have existed.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-solid">
            Home
          </Link>
          <Link href="/shop" className="btn-line">
            The collection
          </Link>
        </div>
      </section>
    </main>
  );
}
