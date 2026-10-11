"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

async function post(url: string, data?: object) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: data ? JSON.stringify(data) : undefined }).catch(() => null);
  if (!r) throw new Error("We couldn't reach the server. Check your connection and try again.");
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Something went wrong — please try again.");
  return d as { ok?: boolean; wait?: number };
}

/** Type the 6-digit code from the email. */
export function VerifyForm({ email, next, sendFirst }: { email: string; next: string; sendFirst: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(sendFirst ? null : null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const sent = useRef(false);

  // count the "send again" pause down
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = async (quiet = false) => {
    setErr(null);
    try {
      const d = await post("/api/account/verify/send");
      if (d.wait) setWait(d.wait);
      else {
        setWait(60);
        if (!quiet) setNote("A new code is on its way.");
      }
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  // arriving from a sign-in with no code pending: send one
  useEffect(() => {
    if (!sendFirst || sent.current) return;
    sent.current = true;
    send(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.replace(/\s+/g, ""))) return setErr("Enter the 6-digit code from the email.");
    setBusy(true);
    setErr(null);
    try {
      await post("/api/account/verify", { code });
      router.replace(next);
      router.refresh();
    } catch (e2) {
      setErr((e2 as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <p className="text-[0.97rem] text-muted text-center">
        We&rsquo;ve emailed a 6-digit code to <strong className="font-medium text-[var(--c-strong)] break-words">{email}</strong>. It lasts 10 minutes.
      </p>
      <label className="block">
        <span className="t-eyebrow block mb-2 text-center">Verification code</span>
        <input
          className="field !h-[3.6rem] text-center text-[1.7rem] tracking-[0.5em] tabular-nums"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          placeholder="••••••"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, ""))}
          autoFocus
        />
      </label>
      {err && (
        <p role="alert" className="text-[0.95rem] text-[var(--c-burgundy)] text-center">
          {err}
        </p>
      )}
      {note && !err && (
        <p role="status" className="text-[0.95rem] text-[var(--c-deep)] text-center">
          {note}
        </p>
      )}
      <button type="submit" className="btn-solid w-full" disabled={busy}>
        {busy ? "Checking…" : "Verify"}
      </button>
      <p className="text-center text-[0.92rem] text-muted">
        Nothing arrived?{" "}
        <button type="button" className="text-[var(--c-strong)] underline underline-offset-4 disabled:opacity-50 disabled:no-underline" disabled={wait > 0} onClick={() => send()}>
          {wait > 0 ? `Send again in ${wait}s` : "Send a new code"}
        </button>
        . Check your spam folder too.
      </p>
    </form>
  );
}
