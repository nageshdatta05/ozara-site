"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "./AuthForm";

async function call(url: string, method: string, data?: unknown) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: data ? JSON.stringify(data) : undefined }).catch(() => null);
  if (!r) throw new Error("We couldn't reach the server. Check your connection and try again.");
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Something went wrong — please try again.");
  return d;
}

/** Register a bracelet with the claim code from the card in its box. */
export function ClaimForm({ initialId = "" }: { initialId?: string }) {
  const router = useRouter();
  const [f, setF] = useState({ braceletId: initialId, code: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (!f.braceletId.trim() || !f.code.trim()) return setMsg({ ok: false, text: "Enter the bracelet ID and the claim code from the card in the box." });
        setBusy(true);
        setMsg(null);
        try {
          const d = await call("/api/account/bracelets", "POST", f);
          setMsg({ ok: true, text: `${d.braceletId} is now registered to you.` });
          setF({ braceletId: "", code: "" });
          router.refresh();
        } catch (er) {
          setMsg({ ok: false, text: (er as Error).message });
        }
        setBusy(false);
      }}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Bracelet ID" value={f.braceletId} onChange={(e) => setF({ ...f, braceletId: e.target.value })} placeholder="BR-000001" autoComplete="off" autoCapitalize="characters" className="uppercase tracking-[0.08em]" />
        <Field label="Claim code" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="XXXX-XXXX" autoComplete="off" autoCapitalize="characters" className="uppercase tracking-[0.12em]" />
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" className="btn-solid" disabled={busy}>
          {busy ? "Registering…" : "Register bracelet"}
        </button>
        {msg && (
          <p role={msg.ok ? "status" : "alert"} className="text-[0.95rem]" style={{ color: msg.ok ? "var(--c-deep)" : "var(--c-burgundy)" }}>
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}

/** The owner's controls for one bracelet. */
export function OwnerControls({ id, status, visibility, lostByOwner }: { id: string; status: "active" | "suspended" | "revoked"; visibility: "initials" | "private"; lostByOwner: boolean }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const url = `/api/account/bracelets/${encodeURIComponent(id)}`;
  const act = async (data: object) => {
    setBusy(true);
    setErr(null);
    try {
      const d = await call(url, "PATCH", data);
      if (d.transferCode) setCode(d.transferCode);
      else router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  };

  if (code)
    return (
      <div className="border border-[rgb(0_7_43/0.2)] bg-[var(--c-deep-tint)] p-5">
        <p className="text-[0.97rem] text-[var(--c-strong)]">{id} has been released from your account. Give the new owner this transfer code with the bracelet — it replaces the code on the original card:</p>
        <p className="mt-3 font-mono text-[1.4rem] tracking-[0.18em] select-all">{code}</p>
        <p className="mt-3 text-[0.85rem] text-faint">It is shown only once. They register the bracelet in their own account with this code.</p>
        <button type="button" className="btn-text mt-4" onClick={() => router.refresh()}>
          Done
        </button>
      </div>
    );

  return (
    <div className="space-y-4">
      {status !== "revoked" && (
        <fieldset className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <legend className="t-eyebrow !text-[12px] mb-2">On the public page, show</legend>
          {(
            [
              ["initials", "My initials"],
              ["private", "“A private owner”"],
            ] as const
          ).map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 text-[0.95rem] cursor-pointer">
              <input type="radio" name={`vis-${id}`} className="accent-[var(--c-deep)]" checked={visibility === v} disabled={busy} onChange={() => act({ action: "visibility", visibility: v })} />
              {l}
            </label>
          ))}
        </fieldset>
      )}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {status === "active" && (
          <button type="button" className="btn-text" disabled={busy} onClick={() => confirmLost() && act({ action: "lost" })}>
            Report lost
          </button>
        )}
        {status === "suspended" && lostByOwner && (
          <button type="button" className="btn-text" disabled={busy} onClick={() => act({ action: "found" })}>
            I&rsquo;ve found it — reactivate
          </button>
        )}
        {status !== "revoked" && (
          <button type="button" className="btn-text" disabled={busy} onClick={() => setTransfer((t) => !t)}>
            Transfer to someone else
          </button>
        )}
      </div>
      {transfer && (
        <form
          className="border border-line p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            act({ action: "release", confirm });
          }}
        >
          <p className="text-[0.95rem] text-muted">
            This removes the bracelet from your account and gives you a new code for its next owner. Your initials will no longer appear on its page.
          </p>
          <Field label={`Type ${id} to confirm`} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" className="uppercase" />
          <button type="submit" className="btn-line" disabled={busy || confirm.trim().toUpperCase() !== id}>
            Release bracelet
          </button>
        </form>
      )}
      {err && (
        <p role="alert" className="text-[0.95rem] text-[var(--c-burgundy)]">
          {err}
        </p>
      )}
    </div>
  );
}

function confirmLost() {
  return window.confirm("Report this bracelet lost? Its public page will say it has been reported lost and it won't open doors at events until you reactivate it.");
}

/** Delete the account (password required). */
export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!open)
    return (
      <button type="button" className="btn-text" onClick={() => setOpen(true)}>
        Delete my account
      </button>
    );
  return (
    <form
      className="border border-[rgb(61_1_3/0.25)] bg-[var(--c-burgundy-tint)] p-5 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);
        try {
          await call("/api/account/delete", "POST", { password: pw });
          router.replace("/");
          router.refresh();
        } catch (er) {
          setErr((er as Error).message);
          setBusy(false);
        }
      }}
    >
      <p className="text-[0.95rem] text-[var(--c-strong)]">
        This deletes your account and your details. Bracelets registered to you are released (their public pages will show them as unregistered). Reservations already placed are kept for our records, without a link to an account.
      </p>
      <Field label="Your password" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && (
        <p role="alert" className="text-[0.95rem] text-[var(--c-burgundy)]">
          {err}
        </p>
      )}
      <div className="flex gap-4">
        <button type="submit" className="btn-solid" disabled={busy || !pw}>
          {busy ? "Deleting…" : "Delete account"}
        </button>
        <button type="button" className="btn-text" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
