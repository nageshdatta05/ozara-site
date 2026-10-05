"use client";

import Link from "next/link";

/** The register couldn't be reached — say so plainly, never guess a result. */
export default function BraceletError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-[100svh] stage grain flex flex-col items-center justify-center text-center px-6">
      <p className="t-eyebrow">OZARA</p>
      <h1 className="t-title mt-4">We couldn&rsquo;t check this bracelet just now.</h1>
      <p className="t-body mt-4 max-w-[36ch]">The register didn&rsquo;t respond. This says nothing about the bracelet itself — please try again.</p>
      <div className="mt-8 flex gap-4">
        <button type="button" onClick={reset} className="btn-solid">
          Try again
        </button>
        <Link href="/authenticity" className="btn-line">
          Enter the ID instead
        </Link>
      </div>
    </main>
  );
}
