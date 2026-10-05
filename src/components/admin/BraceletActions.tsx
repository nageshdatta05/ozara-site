"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Lock } from "./RegisterForm";

type Props = {
  bracelet: {
    id: string;
    status: "active" | "suspended" | "revoked";
    nfcUid: string | null;
    productSlug: string | null;
    batch: string | null;
    notes: string | null;
    owner: { displayName: string; publicLabel: string } | null;
    review: boolean;
  };
  eligibility: { eventId: number; name: string; eventStatus: string; status: "eligible" | "not_eligible" | null }[];
  products: { slug: string; name: string }[];
};

export function BraceletActions({ bracelet: b, eligibility, products }: Props) {
  const router = useRouter();
  const [panel, setPanel] = useState<"none" | "edit" | "revoke" | "owner">("none");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function patch(payload: object) {
    setBusy(true);
    setError(null);
    const r = await fetch(`/api/admin/bracelets/${encodeURIComponent(b.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!r.ok) {
      setError((await r.json()).error ?? "Something went wrong.");
      return false;
    }
    setPanel("none");
    router.refresh();
    return true;
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="t-eyebrow !text-[var(--c-ink)]">Actions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-line" onClick={() => setPanel(panel === "edit" ? "none" : "edit")}>Edit</button>
          <button type="button" className="btn-line" onClick={() => setPanel(panel === "owner" ? "none" : "owner")}>{b.owner ? "Owner" : "Assign owner"}</button>
          {b.status === "active" ? (
            <button type="button" className="btn-line !border-[#c9909a] !text-[#8a2130]" onClick={() => setPanel(panel === "revoke" ? "none" : "revoke")}>Revoke</button>
          ) : (
            <button type="button" className="btn-solid" disabled={busy} onClick={() => patch({ action: "restore" })}>Restore</button>
          )}
          <a href="#history" className="btn-text !text-[var(--c-ink)] self-center ml-2">History</a>
        </div>
        {error && <p role="alert" className="mt-4 text-[0.97rem] text-[#8a2130]">{error}</p>}

        {panel === "edit" && <EditPanel b={b} products={products} busy={busy} onSave={(p) => patch({ action: "update", ...p })} />}
        {panel === "owner" && <OwnerPanel owner={b.owner} busy={busy} onSave={(o) => patch({ action: "owner", owner: o })} />}
        {panel === "revoke" && <RevokePanel id={b.id} busy={busy} onConfirm={(reason, confirm) => patch({ action: "revoke", reason, confirm })} onCancel={() => setPanel("none")} />}

        {b.review && (
          <button type="button" className="btn-text !text-[var(--c-ink)] mt-6" disabled={busy} onClick={() => patch({ action: "clearReview" })}>
            Mark review as resolved
          </button>
        )}
      </section>

      <ClaimCode id={b.id} />

      <section>
        <h2 className="t-eyebrow !text-[var(--c-ink)]">Event eligibility</h2>
        <p className="mt-2 text-[0.9rem] text-[var(--c-ink-muted)]">Separate from authenticity: an authentic bracelet can be ineligible for an event.</p>
        <ul className="mt-4 border-t border-[var(--c-ink-line)]">
          {eligibility.map((e) => (
            <li key={e.eventId} className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-[var(--c-ink-line)]">
              <span className="text-[1rem]">
                {e.name} <span className="text-[0.85rem] text-[var(--c-ink-muted)]">({e.eventStatus})</span>
              </span>
              <span className="flex border border-[var(--c-ink-line)]" role="group" aria-label={`Eligibility for ${e.name}`}>
                {(
                  [
                    ["eligible", "Eligible"],
                    ["not_eligible", "Not eligible"],
                  ] as const
                ).map(([v, label]) => {
                  const on = e.status === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={on}
                      disabled={busy}
                      onClick={() => patch({ action: "eligibility", eventId: e.eventId, status: on ? null : v })}
                      className="px-3 py-1.5 text-[0.78rem] uppercase tracking-[0.12em] transition-colors"
                      style={{ background: on ? (v === "eligible" ? "#1d5b3a" : "#7a5410") : "transparent", color: on ? "#fff" : "var(--c-ink)" }}
                    >
                      {label}
                    </button>
                  );
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function EditPanel({ b, products, busy, onSave }: { b: Props["bracelet"]; products: Props["products"]; busy: boolean; onSave: (p: object) => void }) {
  const [f, setF] = useState({ nfcUid: b.nfcUid ?? "", productSlug: b.productSlug ?? "", batch: b.batch ?? "", notes: b.notes ?? "" });
  return (
    <form
      className="mt-6 border border-[var(--c-ink-line)] p-5 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(f);
      }}
    >
      <Field label="Bracelet ID (permanent)">
        <input className="field" value={b.id} readOnly />
      </Field>
      <Field label="NFC UID" hint={b.nfcUid ? "Permanent once recorded." : "Can be recorded once."}>
        <div className="relative">
          <input className="field uppercase" value={f.nfcUid} readOnly={!!b.nfcUid} onChange={(e) => setF({ ...f, nfcUid: e.target.value })} placeholder="04XXXXXXXXXXXX" />
          {b.nfcUid && <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60"><Lock /></span>}
        </div>
      </Field>
      <Field label="Product / model">
        <select className="field" value={f.productSlug} onChange={(e) => setF({ ...f, productSlug: e.target.value })}>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
          <option value="">Not specified</option>
        </select>
      </Field>
      <Field label="Production batch">
        <input className="field" value={f.batch} onChange={(e) => setF({ ...f, batch: e.target.value })} />
      </Field>
      <Field label="Notes">
        <textarea className="field" rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      </Field>
      <button type="submit" disabled={busy} className="btn-solid">Save changes</button>
    </form>
  );
}

function OwnerPanel({ owner, busy, onSave }: { owner: Props["bracelet"]["owner"]; busy: boolean; onSave: (o: object | null) => void }) {
  const [f, setF] = useState({ displayName: owner?.displayName ?? "", publicLabel: owner?.publicLabel ?? "", email: "" });
  return (
    <form
      className="mt-6 border border-[var(--c-ink-line)] p-5 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(f.displayName.trim() ? f : null);
      }}
    >
      <Field label="Owner name (private)">
        <input className="field" value={f.displayName} onChange={(e) => setF({ ...f, displayName: e.target.value })} />
      </Field>
      <Field label="Shown publicly as" hint="e.g. initials. Leave empty to show only “Registered to an owner”.">
        <input className="field" value={f.publicLabel} onChange={(e) => setF({ ...f, publicLabel: e.target.value })} placeholder="A. R." />
      </Field>
      <Field label="Email (private, optional)">
        <input className="field" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy || !f.displayName.trim()} className="btn-solid disabled:opacity-50">Save owner</button>
        {owner && (
          <button type="button" disabled={busy} className="btn-line" onClick={() => onSave(null)}>Remove owner</button>
        )}
      </div>
    </form>
  );
}

function RevokePanel({ id, busy, onConfirm, onCancel }: { id: string; busy: boolean; onConfirm: (reason: string, confirm: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const ok = confirm.trim().toUpperCase() === id;
  return (
    <form
      role="alertdialog"
      aria-label={`Revoke ${id}`}
      className="mt-6 border border-[#c9909a] bg-[#f8ecee] p-5 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onConfirm(reason, confirm);
      }}
    >
      <p className="text-[1rem] text-[#8a2130]">
        Revoking makes the public page show <strong className="font-medium">“No longer valid”</strong> and refuses event entry. You can restore it later.
      </p>
      <Field label="Reason (internal)">
        <input className="field" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reported lost" />
      </Field>
      <Field label={`Type ${id} to confirm`}>
        <input className="field uppercase" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
      </Field>
      <div className="flex gap-3">
        <button type="submit" disabled={busy || !ok} className="btn-solid !bg-[#8a2130] !border-[#8a2130] !text-white disabled:opacity-40">Revoke bracelet</button>
        <button type="button" className="btn-line" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/**
 * The claim code — printed on the card that goes in the box. The customer
 * types it in their account to register the bracelet. Shown once: only a
 * hash is stored. Issuing a new one invalidates the old.
 */
function ClaimCode({ id }: { id: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    try {
      const k = `ozr-claim-${id}`;
      const v = sessionStorage.getItem(k);
      if (v) {
        setCode(v);
        sessionStorage.removeItem(k);
      }
    } catch {
      /* ignore */
    }
  }, [id]);
  async function issue() {
    if (!confirm("Issue a new claim code? The current code will stop working.")) return;
    setBusy(true);
    setErr(null);
    const r = await fetch(`/api/admin/bracelets/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "claimCode" }) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error ?? "Could not issue a code.");
    setCode(d.claimCode);
  }
  return (
    <section>
      <h2 className="t-eyebrow !text-[var(--c-ink)]">Claim code</h2>
      <p className="mt-2 text-[0.9rem] text-[var(--c-ink-muted)]">Printed on the card in the box. The owner enters it in their account to register this bracelet.</p>
      {code && (
        <div className="mt-4 border border-[#bfd9c8] bg-[#e3efe7] p-4">
          <p className="text-[0.875rem] text-[#1d5b3a]">Copy it now — it won&rsquo;t be shown again.</p>
          <p className="mt-2 font-mono text-[1.5rem] tracking-[0.18em] text-[#123d2b] select-all">{code}</p>
        </div>
      )}
      {err && <p role="alert" className="mt-3 text-[0.97rem] text-[#8a2130]">{err}</p>}
      <button type="button" className="btn-line mt-4" disabled={busy} onClick={issue}>
        {busy ? "Issuing…" : "Issue new claim code"}
      </button>
    </section>
  );
}
