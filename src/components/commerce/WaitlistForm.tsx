"use client";

import { useId, useState } from "react";
import { waitlist } from "@/config/site";

type Props = {
  product?: string;
  source: string;
  cta?: string;
  className?: string;
  /** "stacked" puts the button under the field (narrow columns). */
  layout?: "inline" | "stacked";
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The waiting list. Saved to the site database (admin → Messages).
 * Validates before sending, handles "already on the list", and keeps a
 * hidden honeypot field that only bots fill in.
 */
export function WaitlistForm({ product, source, cta = "Join the waiting list", className = "", layout = "inline" }: Props) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "sending" | "joined" | "already" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!EMAIL.test(v)) {
      setState("error");
      setError(v ? "That doesn't look like an email address." : "Please enter your email address.");
      return;
    }
    setState("sending");
    setError(null);
    try {
      const r = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v, product, source, company }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Something went wrong — please try again.");
      setState(d.status === "already" ? "already" : "joined");
    } catch (err) {
      setState("error");
      setError((err as Error).message.includes("fetch") ? "We couldn't reach the server. Check your connection and try again." : (err as Error).message);
    }
  };

  if (state === "joined" || state === "already")
    return (
      <p className={`text-[1.02rem] text-[var(--c-strong)] ${className}`} role="status">
        {state === "joined" ? waitlist.success : waitlist.already}
      </p>
    );

  return (
    <form onSubmit={submit} className={className} noValidate>
      <div className={`flex gap-2 ${layout === "stacked" ? "flex-col" : "flex-col sm:flex-row"}`}>
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="Email address"
          value={email}
          aria-invalid={state === "error" || undefined}
          aria-describedby={`${id}-msg`}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          className={`field ${layout === "stacked" ? "" : "sm:flex-1"} min-w-0 !h-[3.25rem] !px-4`}
          style={state === "error" ? { borderColor: "var(--c-burgundy)" } : undefined}
        />
        {/* honeypot — hidden from people and screen readers */}
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={company} onChange={(e) => setCompany(e.target.value)} name="company" />
        <button type="submit" className="btn-solid shrink-0" disabled={state === "sending"}>
          {state === "sending" ? "Joining…" : cta}
        </button>
      </div>
      <p id={`${id}-msg`} className="mt-3 text-[0.82rem]" style={{ color: state === "error" ? "var(--c-burgundy)" : "var(--c-text-faint)" }} role={state === "error" ? "alert" : undefined}>
        {state === "error" ? error : waitlist.privacy}
      </p>
    </form>
  );
}
