"use client";

import Link from "next/link";
import { useEffect } from "react";
import { EyeMark } from "@/components/brand/Emblem";

/** Something failed while loading a page — never shows technical details. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="min-h-[80svh] stage grain flex flex-col items-center justify-center text-center px-6 pt-[var(--nav-h)]">
      <EyeMark className="w-12 text-[var(--c-strong)]" />
      <h1 className="t-title mt-8">Something didn&rsquo;t load.</h1>
      <p className="t-body mt-4 max-w-[40ch]">Please try again. If it keeps happening, our team has been told and we&rsquo;re looking into it.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button type="button" onClick={reset} className="btn-solid">
          Try again
        </button>
        <Link href="/" className="btn-line">
          Home
        </Link>
      </div>
    </section>
  );
}
