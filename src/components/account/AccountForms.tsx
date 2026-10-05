"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Customer } from "@/server/customers";
import { Field } from "./AuthForm";

async function call(url: string, method: string, data?: unknown) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: data ? JSON.stringify(data) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Something went wrong.");
  return d;
}

export function DetailsForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [f, setF] = useState({ name: customer.name, email: customer.email, phone: customer.phone ?? "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMsg(null);
        try {
          await call("/api/account/me", "PATCH", f);
          setMsg({ ok: true, text: "Saved." });
          router.refresh();
        } catch (er) {
          setMsg({ ok: false, text: (er as Error).message });
        }
        setBusy(false);
      }}
    >
      <Field label="Name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <Field label="Phone (optional)" type="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <div className="flex items-center gap-5">
        <button type="submit" className="btn-line" disabled={busy}>
          Save details
        </button>
        {msg && (
          <p role="status" className="text-[0.95rem]" style={{ color: msg.ok ? "var(--c-deep)" : "var(--c-burgundy)" }}>
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [f, setF] = useState({ current: "", next: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg(null);
        try {
          await call("/api/account/password", "POST", f);
          setF({ current: "", next: "" });
          setMsg({ ok: true, text: "Password changed. Other devices have been signed out." });
        } catch (er) {
          setMsg({ ok: false, text: (er as Error).message });
        }
      }}
    >
      <Field label="Current password" type="password" autoComplete="current-password" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} />
      <Field label="New password" type="password" autoComplete="new-password" hint="At least 8 characters." value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} />
      <div className="flex items-center gap-5">
        <button type="submit" className="btn-line">
          Change password
        </button>
        {msg && (
          <p role="status" className="text-[0.95rem]" style={{ color: msg.ok ? "var(--c-deep)" : "var(--c-burgundy)" }}>
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}

export function SignOut() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn-text"
      onClick={async () => {
        await call("/api/account/logout", "POST");
        router.replace("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
