"use client";

import { useState } from "react";
import { Field } from "@/components/account/AuthForm";

const TOPICS = ["The collection", "My reservation", "My bracelet", "Clubs & organisations", "Press", "Something else"];

/** Contact form → /api/contact (saved, and emailed to the inbox when configured). */
export function ContactForm({ initialTopic }: { initialTopic?: string }) {
  const start = initialTopic && TOPICS.includes(initialTopic) ? initialTopic : initialTopic ? "Something else" : "";
  const [f, setF] = useState({ name: "", email: "", topic: start, message: initialTopic && !TOPICS.includes(initialTopic) ? `${initialTopic}\n\n` : "", company: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  if (state === "sent")
    return (
      <div role="status" className="border border-line bg-[rgb(246_242_236/0.7)] p-7">
        <p className="t-subtitle">Thank you, {f.name.split(" ")[0]}.</p>
        <p className="t-body mt-3">Your message has reached us and we&rsquo;ll reply personally to {f.email}.</p>
      </div>
    );

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const problem = !f.name.trim()
          ? "Please tell us your name."
          : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())
            ? "Please enter a valid email address."
            : !f.topic
              ? "Please choose a topic."
              : f.message.trim().length < 10
                ? "Please write a little more so we can help."
                : null;
        if (problem) {
          setState("error");
          return setErr(problem);
        }
        setState("sending");
        setErr(null);
        const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) }).catch(() => null);
        if (!r) {
          setState("error");
          return setErr("We couldn't reach the server. Check your connection and try again — your message hasn't been sent.");
        }
        if (!r.ok) {
          setState("error");
          return setErr((await r.json().catch(() => ({}))).error ?? "Something went wrong — please try again.");
        }
        setState("sent");
      }}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Name" autoComplete="name" value={f.name} onChange={set("name")} />
        <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={set("email")} />
      </div>
      <label className="block">
        <span className="t-eyebrow block mb-2">Topic</span>
        <select className="field !h-[3.1rem]" value={f.topic} onChange={set("topic")}>
          <option value="">Choose a topic…</option>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="t-eyebrow block mb-2">Message</span>
        <textarea className="field min-h-[9rem]" value={f.message} onChange={set("message")} />
      </label>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" name="company" value={f.company} onChange={set("company")} />
      {state === "error" && err && (
        <p role="alert" className="text-[0.95rem] text-[var(--c-burgundy)]">
          {err}
        </p>
      )}
      <button type="submit" className="btn-solid" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
      <p className="text-[0.82rem] text-faint">We use your details only to reply. See our Privacy Policy.</p>
    </form>
  );
}
