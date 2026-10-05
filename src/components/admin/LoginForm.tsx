"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
        setBusy(false);
        if (!r.ok) return setError((await r.json()).error ?? "Sign-in failed.");
        router.push("/admin/nfc");
        router.refresh();
      }}
    >
      <label htmlFor="pw" className="t-eyebrow block mb-2">Password</label>
      <input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
      {error && <p role="alert" className="mt-3 text-[0.95rem] text-[#8a2130]">{error}</p>}
      <button type="submit" disabled={busy || !password} className="btn-solid w-full mt-6 disabled:opacity-50">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
