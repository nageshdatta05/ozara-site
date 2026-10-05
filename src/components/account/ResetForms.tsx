"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "./AuthForm";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  if (state === "sent")
    return (
      <div role="status" className="space-y-4">
        <p className="text-[1.02rem] text-[var(--c-strong)]">If there is an account for {email}, we&rsquo;ve sent it a link to choose a new password. It works for one hour.</p>
        <Link href="/account/login" className="btn-text">
          Back to sign in
        </Link>
      </div>
    );
  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
          setState("error");
          return setErr("Please enter the email address you signed up with.");
        }
        setState("sending");
        const r = await fetch("/api/account/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }).catch(() => null);
        if (!r || !r.ok) {
          setState("error");
          return setErr(r ? ((await r.json().catch(() => ({}))).error ?? "Something went wrong.") : "We couldn't reach the server. Try again.");
        }
        setState("sent");
      }}
    >
      <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {state === "error" && err && (
        <p role="alert" className="text-[0.95rem] text-[var(--c-burgundy)]">
          {err}
        </p>
      )}
      <button type="submit" className="btn-solid w-full" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (pw.length < 8) return setErr("Use at least 8 characters.");
        setBusy(true);
        setErr(null);
        const r = await fetch("/api/account/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: pw }) }).catch(() => null);
        if (!r || !r.ok) {
          setBusy(false);
          return setErr(r ? ((await r.json().catch(() => ({}))).error ?? "Something went wrong.") : "We couldn't reach the server. Try again.");
        }
        router.replace("/account");
        router.refresh();
      }}
    >
      <Field label="New password" type="password" autoComplete="new-password" hint="At least 8 characters." value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && (
        <p role="alert" className="text-[0.95rem] text-[var(--c-burgundy)]">
          {err}
        </p>
      )}
      <button type="submit" className="btn-solid w-full" disabled={busy}>
        {busy ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
