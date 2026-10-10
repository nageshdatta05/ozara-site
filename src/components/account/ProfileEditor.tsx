"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { OwnerProfile, ProfileField } from "@/server/profiles";

type Text = Exclude<ProfileField, "photo">;

const FIELDS: { key: Text; label: string; placeholder: string; type?: string; inputMode?: "tel" | "email" | "url" | "text" }[] = [
  { key: "name", label: "Name", placeholder: "How you'd like to be known" },
  { key: "headline", label: "Line under your name", placeholder: "e.g. Founder, Studio Name" },
  { key: "phone", label: "Phone", placeholder: "+91 98765 43210", type: "tel", inputMode: "tel" },
  { key: "email", label: "Email", placeholder: "you@example.com", type: "email", inputMode: "email" },
  { key: "website", label: "Website", placeholder: "yourname.com", inputMode: "url" },
  { key: "instagram", label: "Instagram", placeholder: "your handle" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/…", inputMode: "url" },
];

async function call(url: string, method: string, data?: BodyInit | object, headers?: Record<string, string>) {
  const isRaw = data instanceof Blob;
  const r = await fetch(url, {
    method,
    headers: isRaw ? headers : { "Content-Type": "application/json" },
    body: data === undefined ? undefined : isRaw ? data : JSON.stringify(data),
  }).catch(() => null);
  if (!r) throw new Error("We couldn't reach the server. Check your connection and try again.");
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Something went wrong — please try again.");
  return d;
}

/** Crop to a square and shrink to a small JPEG in the browser — also strips location data from the photo. */
function squareJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const out = Math.min(480, side);
      const c = document.createElement("canvas");
      c.width = c.height = out;
      const ctx = c.getContext("2d");
      if (!ctx) return reject(new Error("Your browser can't process photos."));
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, out, out);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("That photo couldn't be read."))), "image/jpeg", 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file isn't a photo we can read. Try a JPEG or PNG."));
    };
    img.src = url;
  });
}

/** The owner chooses what their bracelet's tap page shows. */
export function ProfileEditor({ id, profile, disabled }: { id: string; profile: OwnerProfile; disabled: boolean }) {
  const router = useRouter();
  const base = `/api/account/bracelets/${encodeURIComponent(id)}`;
  const [published, setPublished] = useState(profile.published);
  const [values, setValues] = useState(profile.values);
  const [shown, setShown] = useState<Set<ProfileField>>(new Set(profile.shown));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState(profile.hasPhoto);
  const [stamp, setStamp] = useState(0);
  const file = useRef<HTMLInputElement>(null);

  const toggle = (f: ProfileField) =>
    setShown((s) => {
      const n = new Set(s);
      if (n.has(f)) n.delete(f);
      else n.add(f);
      return n;
    });

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
    setBusy(false);
  };

  const save = () =>
    run(async () => {
      await call(`${base}/profile`, "PUT", { published, values, shown: [...shown] });
      setMsg({ ok: true, text: published ? "Saved. Your tap page is live." : "Saved. Your tap page is switched off." });
      router.refresh();
    });

  const upload = (f: File | undefined) =>
    f &&
    run(async () => {
      const blob = await squareJpeg(f);
      await call(`${base}/photo`, "PUT", blob, { "Content-Type": "image/jpeg" });
      setPhoto(true);
      setStamp(Date.now());
      setShown((s) => new Set(s).add("photo"));
      setMsg({ ok: true, text: "Photo added. Press Save to publish it." });
    });

  const removePhoto = () =>
    run(async () => {
      await call(`${base}/photo`, "DELETE");
      setPhoto(false);
      setMsg({ ok: true, text: "Photo removed." });
      router.refresh();
    });

  return (
    <details className="group border border-line">
      <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4">
        <span className="t-eyebrow !text-[var(--c-strong)]">Your tap page</span>
        <span className="text-[0.9rem] text-muted">{profile.published ? "Live" : "Off"}</span>
      </summary>

      <div className="px-5 pb-6 pt-1 space-y-6">
        {disabled ? (
          <p className="text-[0.95rem] text-muted">This bracelet is not active, so its tap page can&rsquo;t be edited right now.</p>
        ) : (
          <>
            <p className="text-[0.95rem] text-muted max-w-[52ch]">
              This is what someone sees when they tap your bracelet. You decide what appears. Tick <strong className="font-medium text-[var(--c-strong)]">Show</strong> only for what you&rsquo;re happy for anyone who taps it to see.
            </p>

            <label className="flex items-center gap-3 text-[1rem] cursor-pointer">
              <input type="checkbox" className="size-5 accent-[var(--c-deep)]" checked={published} disabled={busy} onChange={(e) => setPublished(e.target.checked)} />
              Show my tap page when someone taps my bracelet
            </label>

            <div className="flex items-center gap-5 border-t border-line pt-5">
              <div className="size-20 rounded-full overflow-hidden bg-[var(--c-deep-tint)] ring-1 ring-[var(--c-line)] shrink-0">
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element -- previewing the owner's own photo through the public route
                  <img src={`/b/${encodeURIComponent(id)}/photo?v=${stamp}`} alt="" className="size-full object-cover" onError={() => undefined} />
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  <button type="button" className="btn-text" disabled={busy} onClick={() => file.current?.click()}>
                    {photo ? "Change photo" : "Add a photo"}
                  </button>
                  {photo && (
                    <button type="button" className="btn-text" disabled={busy} onClick={removePhoto}>
                      Remove
                    </button>
                  )}
                </div>
                <label className="flex items-center gap-2 text-[0.9rem] cursor-pointer">
                  <input type="checkbox" className="accent-[var(--c-deep)]" checked={shown.has("photo")} disabled={busy || !photo} onChange={() => toggle("photo")} />
                  Show
                </label>
                <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
              </div>
            </div>

            <div className="space-y-5">
              {FIELDS.map((f) => (
                <div key={f.key} className="grid grid-cols-[1fr_auto] items-end gap-x-5">
                  <label className="block">
                    <span className="t-eyebrow block mb-2">{f.label}</span>
                    <input
                      className="field !h-[3.1rem]"
                      type={f.type ?? "text"}
                      inputMode={f.inputMode}
                      value={values[f.key]}
                      placeholder={f.placeholder}
                      maxLength={f.key === "website" || f.key === "linkedin" ? 200 : f.key === "headline" ? 80 : f.key === "name" ? 60 : 120}
                      disabled={busy}
                      autoComplete="off"
                      onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    />
                  </label>
                  <label className="flex items-center gap-2 h-[3.1rem] text-[0.9rem] cursor-pointer">
                    <input type="checkbox" className="accent-[var(--c-deep)]" checked={shown.has(f.key)} disabled={busy || !values[f.key].trim()} onChange={() => toggle(f.key)} />
                    Show
                  </label>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <button type="button" className="btn-solid" disabled={busy} onClick={save}>
                {busy ? "Saving…" : "Save"}
              </button>
              <Link href={`/b/${encodeURIComponent(id)}`} className="btn-text" target="_blank">
                See your tap page
              </Link>
              {msg && (
                <p role={msg.ok ? "status" : "alert"} className="text-[0.95rem]" style={{ color: msg.ok ? "var(--c-deep)" : "var(--c-burgundy)" }}>
                  {msg.text}
                </p>
              )}
            </div>
            <p className="text-[0.82rem] text-faint max-w-[56ch]">Anything you show can be seen by anyone who taps or opens your bracelet&rsquo;s link. You can change or switch it off at any time, and it is erased if you transfer the bracelet or delete your account.</p>
          </>
        )}
      </div>
    </details>
  );
}
