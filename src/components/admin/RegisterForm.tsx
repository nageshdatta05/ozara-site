"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  base: string;
  events: { id: number; name: string; status: string }[];
  products: { slug: string; name: string }[];
};

export function RegisterForm({ base, events, products }: Props) {
  const router = useRouter();
  const [f, setF] = useState({ braceletId: "", nfcUid: "", productSlug: products[0]?.slug ?? "", batch: "", status: "active", notes: "", orderRef: "" });
  const [eligible, setEligible] = useState<number[]>(events.filter((e) => e.status === "live").map((e) => e.id));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const id = f.braceletId.trim().toUpperCase();

  return (
    <form
      className="mt-10 space-y-12"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const r = await fetch("/api/admin/bracelets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...f, eligibleEventIds: eligible }),
        });
        const data = await r.json();
        setBusy(false);
        if (!r.ok) return setError(data.error ?? "Could not register.");
        try {
          // shown once on the next page; only a hash is stored
          sessionStorage.setItem(`ozr-claim-${data.bracelet_id}`, data.claimCode);
        } catch {
          /* ignore */
        }
        router.push(`/admin/nfc/bracelets/${data.bracelet_id}?registered=1`);
        router.refresh();
      }}
    >
      <fieldset className="border border-[var(--c-ink-line)] p-6">
        <legend className="px-2 t-eyebrow !text-[var(--c-ink)] flex items-center gap-2">
          <Lock /> Permanent identifiers
        </legend>
        <p className="text-[0.92rem] text-[var(--c-ink-muted)] -mt-1 mb-6">These cannot be changed after registration.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Bracelet ID" hint="Written into the tag URL. Letters, numbers, hyphens.">
            <input className="field uppercase tracking-[0.08em]" required value={f.braceletId} onChange={set("braceletId")} placeholder="BR-000005" autoComplete="off" />
          </Field>
          <Field label="NFC UID" hint="The chip's factory UID, read with an NFC tool. Optional now; permanent once set.">
            <input className="field uppercase tracking-[0.08em]" value={f.nfcUid} onChange={set("nfcUid")} placeholder="04XXXXXXXXXXXX" autoComplete="off" />
          </Field>
        </div>
        <div className="mt-6 bg-white/70 border border-[var(--c-ink-line)] px-4 py-3">
          <p className="t-eyebrow !text-[12px]">URL to write into the tag</p>
          <p className="mt-1 tabular-nums break-all text-[1.02rem]">{base}/b/{id || "…"}</p>
        </div>
      </fieldset>

      <fieldset className="border border-[var(--c-ink-line)] p-6">
        <legend className="px-2 t-eyebrow !text-[var(--c-ink)]">Details — editable later</legend>
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Product / model">
            <select className="field" value={f.productSlug} onChange={set("productSlug")}>
              {products.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
              <option value="">Not specified</option>
            </select>
          </Field>
          <Field label="Production batch">
            <input className="field" value={f.batch} onChange={set("batch")} placeholder="B-2026-02" />
          </Field>
          <Field label="Order reference (optional)">
            <input className="field uppercase" value={f.orderRef} onChange={set("orderRef")} placeholder="OZ-XXXXXX" />
          </Field>
          <Field label="Status">
            <select className="field" value={f.status} onChange={set("status")}>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
            </select>
          </Field>
          <Field label="Event eligibility">
            <div className="space-y-2 pt-1">
              {events.length === 0 && <p className="text-[0.92rem] text-[var(--c-ink-muted)]">No upcoming events.</p>}
              {events.map((ev) => (
                <label key={ev.id} className="flex items-center gap-3 text-[1rem]">
                  <input
                    type="checkbox"
                    checked={eligible.includes(ev.id)}
                    onChange={(e) => setEligible(e.target.checked ? [...eligible, ev.id] : eligible.filter((x) => x !== ev.id))}
                    className="size-4 accent-[var(--c-ink)]"
                  />
                  {ev.name} <span className="text-[var(--c-ink-muted)] text-[0.875rem]">({ev.status})</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Notes" className="md:col-span-2">
            <textarea className="field" rows={3} value={f.notes} onChange={set("notes")} />
          </Field>
        </div>
      </fieldset>

      {error && <p role="alert" className="text-[1rem] text-[#8a2130]">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={busy || !id} className="btn-solid disabled:opacity-50">{busy ? "Registering…" : "Register bracelet"}</button>
      </div>
    </form>
  );
}

export function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="t-eyebrow !text-[12px] block mb-2">{label}</span>
      {children}
      {hint && <span className="block mt-1.5 text-[0.85rem] text-[var(--c-ink-muted)]">{hint}</span>}
    </label>
  );
}

export function Lock() {
  return (
    <svg aria-hidden width="11" height="12" viewBox="0 0 11 12" fill="none" stroke="currentColor">
      <rect x="1" y="5" width="9" height="6.5" rx="1" />
      <path d="M3 5V3.5a2.5 2.5 0 015 0V5" />
    </svg>
  );
}
