"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/** Sign in / create account — one form, two modes. */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem =
      mode === "register" && !f.name.trim()
        ? "Please tell us your name."
        : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())
          ? "Please enter a valid email address."
          : !f.password
            ? "Please enter your password."
            : mode === "register" && f.password.length < 8
              ? "Use at least 8 characters for your password."
              : null;
    if (problem) return setErr(problem);
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/account/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { email: f.email, password: f.password } : f),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Something went wrong — please try again.");
      router.replace(safeNext);
      router.refresh();
    } catch (e) {
      const m = (e as Error).message;
      setErr(/fetch|network/i.test(m) ? "We couldn't reach the server. Check your connection and try again." : m);
      setBusy(false);
    }
  };

  const q = safeNext !== "/account" ? `?next=${encodeURIComponent(safeNext)}` : "";
  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {mode === "register" && <Field label="Name" autoComplete="name" value={f.name} onChange={set("name")} />}
      <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={set("email")} />
      <Field
        label="Password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        value={f.password}
        onChange={set("password")}
        hint={mode === "register" ? "At least 8 characters." : undefined}
      />
      {err && (
        <p role="alert" className="text-[0.95rem] text-[var(--c-burgundy)]">
          {err}
        </p>
      )}
      <button type="submit" className="btn-solid w-full" disabled={busy}>
        {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
      {mode === "login" && (
        <p className="text-center">
          <Link href="/account/forgot" className="btn-text">
            Forgotten your password?
          </Link>
        </p>
      )}
      <p className="text-[0.95rem] text-muted text-center pt-2">
        {mode === "login" ? (
          <>
            New to OZARA?{" "}
            <Link href={`/account/register${q}`} className="text-[var(--c-strong)] underline underline-offset-4">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/account/login${q}`} className="text-[var(--c-strong)] underline underline-offset-4">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

export function Field({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="t-eyebrow block mb-2">{label}</span>
      <input {...props} className={`field !h-[3.1rem] ${props.className ?? ""}`} />
      {hint && <span className="block mt-1.5 text-[0.82rem] text-faint">{hint}</span>}
    </label>
  );
}
