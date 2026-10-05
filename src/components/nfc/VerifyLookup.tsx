"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Type a bracelet ID (or paste its link) → open its verification page. */
export function VerifyLookup() {
  const router = useRouter();
  const [v, setV] = useState("");
  return (
    <form
      className="border border-[var(--c-line-strong)] bg-[rgb(246_242_236/0.6)] backdrop-blur-md p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = v.trim();
        if (!raw) return;
        const m = raw.match(/\/b\/([^/?#]+)/i);
        router.push(`/b/${encodeURIComponent((m ? m[1] : raw).toUpperCase())}`);
      }}
    >
      <label htmlFor="bid" className="t-eyebrow block">Verify a bracelet</label>
      <p className="text-[0.95rem] text-muted mt-2">Enter the bracelet ID, or simply tap the bracelet with your phone.</p>
      <div className="mt-5 flex gap-2">
        <input
          id="bid"
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder="BR-000001"
          autoComplete="off"
          autoCapitalize="characters"
          className="field !h-[3.25rem] uppercase tracking-[0.1em] placeholder:normal-case placeholder:tracking-normal"
        />
        <button type="submit" className="btn-solid shrink-0" disabled={!v.trim()}>
          Verify
        </button>
      </div>
    </form>
  );
}
