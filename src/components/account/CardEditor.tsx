"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CardStyle, OwnerProfile, ProfileField, PublicProfile } from "@/server/profiles";
import { ProfileCard } from "@/components/nfc/ProfileCard";

type Text = Exclude<ProfileField, "photo">;

const FINISHES: { key: CardStyle; label: string; swatch: string }[] = [
  { key: "midnight", label: "Midnight", swatch: "linear-gradient(135deg,#1b2a78,#00072b)" },
  { key: "burgundy", label: "Burgundy", swatch: "linear-gradient(135deg,#8a1a26,#3d0103)" },
  { key: "ivory", label: "Ivory", swatch: "linear-gradient(135deg,#fffdf9,#ddd3c1)" },
];

type FieldDef = { key: Text; label: string; placeholder: string; type?: string; inputMode?: "tel" | "email" | "url" | "text"; max: number; multiline?: boolean; prefix?: string };

const SECTIONS: { title: string; hint: string; fields: FieldDef[] }[] = [
  {
    title: "About you",
    hint: "The front of your card.",
    fields: [
      { key: "name", label: "Your name", placeholder: "How you'd like to be known", max: 60 },
      { key: "headline", label: "Line under your name", placeholder: "e.g. Founder, Studio Name", max: 80 },
      { key: "location", label: "Based in", placeholder: "e.g. Mumbai", max: 60 },
      { key: "bio", label: "A little about you", placeholder: "One or two short lines", max: 160, multiline: true },
    ],
  },
  {
    title: "How to reach you",
    hint: "The back of your card.",
    fields: [
      { key: "phone", label: "Phone", placeholder: "+91 98765 43210", type: "tel", inputMode: "tel", max: 30 },
      { key: "email", label: "Email", placeholder: "you@example.com", type: "email", inputMode: "email", max: 120 },
    ],
  },
  {
    title: "Links",
    hint: "Shown as small buttons on the back.",
    fields: [
      { key: "website", label: "Website", placeholder: "yourname.com", inputMode: "url", max: 200 },
      { key: "instagram", label: "Instagram", placeholder: "yourhandle", max: 120, prefix: "@" },
      { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/…", inputMode: "url", max: 200 },
    ],
  },
];

async function call(url: string, method: string, data?: object | Blob, headers?: Record<string, string>) {
  const raw = data instanceof Blob;
  const r = await fetch(url, { method, headers: raw ? headers : { "Content-Type": "application/json" }, body: data === undefined ? undefined : raw ? data : JSON.stringify(data) }).catch(() => null);
  if (!r) throw new Error("We couldn't reach the server. Check your connection and try again.");
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "Something went wrong — please try again.");
  return d;
}

/** Crop to a square and shrink to a small JPEG in the browser; this also strips location data from the photo. */
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

/** What the card will show, from what's typed — a light version of the server's cleaning, for the preview only. */
function previewProfile(values: Record<Text, string>, shown: Set<ProfileField>, hasPhoto: boolean, cardStyle: CardStyle): PublicProfile {
  const pick = (k: Text) => (shown.has(k) && values[k].trim() ? values[k].trim() : null);
  const site = pick("website");
  const insta = pick("instagram");
  const li = pick("linkedin");
  return {
    cardStyle,
    name: pick("name"),
    headline: pick("headline"),
    location: pick("location"),
    bio: pick("bio"),
    photo: shown.has("photo") && hasPhoto,
    phone: pick("phone"),
    email: pick("email"),
    website: site ? (/^https?:\/\//i.test(site) ? site : `https://${site}`) : null,
    instagram: insta ? insta.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "").replace(/^@/, "") : null,
    linkedin: li ? (/^https?:\/\//i.test(li) ? li : `https://${li}`) : null,
  };
}

function Switch({ on, onChange, disabled, label }: { on: boolean; onChange: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className="relative h-[1.65rem] w-[2.9rem] shrink-0 rounded-full transition-colors duration-300 disabled:opacity-35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-accent)]"
      style={{ background: on ? "var(--c-deep)" : "rgb(0 7 43 / 0.2)" }}
    >
      <span className="absolute left-[3px] top-[3px] size-[1.25rem] rounded-full bg-white shadow transition-transform duration-300" style={{ transform: on ? "translateX(1.25rem)" : "none" }} />
    </button>
  );
}

/**
 * The card editor: change what people see when they tap your bracelet, and
 * watch the card change as you type. Each detail has its own switch.
 */
export function CardEditor({ id, profile, productName }: { id: string; profile: OwnerProfile; productName: string }) {
  const router = useRouter();
  const base = `/api/account/bracelets/${encodeURIComponent(id)}`;
  const [published, setPublished] = useState(profile.published);
  const [cardStyle, setCardStyle] = useState<CardStyle>(profile.cardStyle);
  const [values, setValues] = useState<Record<Text, string>>(profile.values);
  const [shown, setShown] = useState<Set<ProfileField>>(new Set(profile.shown));
  const [hasPhoto, setHasPhoto] = useState(profile.hasPhoto);
  const [ver, setVer] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const file = useRef<HTMLInputElement>(null);

  const snapshot = (p: boolean, c: CardStyle, v: Record<Text, string>, s: Set<ProfileField>) => JSON.stringify({ p, c, v, s: [...s].sort() });
  const saved = useRef(snapshot(profile.published, profile.cardStyle, profile.values, new Set(profile.shown)));
  const dirty = snapshot(published, cardStyle, values, shown) !== saved.current;

  // once you start changing things again, the "Saved" message steps aside
  useEffect(() => {
    if (dirty) setMsg((m) => (m?.ok ? null : m));
  }, [dirty]);

  // a gentle warning before leaving with changes that aren't saved
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const preview = useMemo(() => previewProfile(values, shown, hasPhoto, cardStyle), [values, shown, hasPhoto, cardStyle]);

  const toggle = (f: ProfileField) =>
    setShown((s) => {
      const n = new Set(s);
      if (n.has(f)) n.delete(f);
      else n.add(f);
      return n;
    });

  // typing into an empty field switches it on: the usual case is "I added it, so show it"
  const type = (k: Text, v: string) => {
    if (!values[k].trim() && v.trim()) setShown((s) => new Set(s).add(k));
    setValues((x) => ({ ...x, [k]: v }));
  };

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
      await call(`${base}/profile`, "PUT", { published, cardStyle, values, shown: [...shown] });
      saved.current = snapshot(published, cardStyle, values, shown);
      setMsg({ ok: true, text: published ? "Saved. Your card is live." : "Saved. Your card is hidden." });
      router.refresh();
    });

  const upload = (f?: File) =>
    f &&
    run(async () => {
      const blob = await squareJpeg(f);
      await call(`${base}/photo`, "PUT", blob, { "Content-Type": "image/jpeg" });
      setHasPhoto(true);
      setVer(Date.now());
      setShown((s) => new Set(s).add("photo"));
    });

  const removePhoto = () =>
    run(async () => {
      await call(`${base}/photo`, "DELETE");
      setHasPhoto(false);
      setShown((s) => {
        const n = new Set(s);
        n.delete("photo");
        return n;
      });
    });

  const empty = !preview.name && !preview.headline && !preview.location && !preview.bio && !preview.photo && !preview.phone && !preview.email && !preview.website && !preview.instagram && !preview.linkedin;

  return (
    <div className="bg-paper">
      <section className="relative stage grain pt-[calc(var(--nav-h)+7vh)] pb-[5vh] overflow-hidden">
        <div className="shell relative">
          <Link href="/account/bracelets" className="btn-text">
            ← Your bracelets
          </Link>
          <h1 className="t-display mt-5">Your card</h1>
          <p className="t-body mt-3 max-w-[48ch]">Choose what people see when they tap your {productName}. Switch each detail on or off, and watch the card change.</p>
        </div>
      </section>

      {/* phones: edit or preview, one at a time */}
      <div className="lg:hidden shell pt-6">
        <div role="tablist" aria-label="View" className="grid grid-cols-2 border border-line">
          {(["edit", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className="py-3 text-[0.8rem] uppercase tracking-[0.18em] transition-colors"
              style={{ background: tab === t ? "var(--c-deep)" : "transparent", color: tab === t ? "#fff" : "var(--c-strong)" }}
            >
              {t === "edit" ? "Edit" : "Preview"}
            </button>
          ))}
        </div>
      </div>

      <div className="shell py-[clamp(2rem,6vh,4rem)] grid lg:grid-cols-12 gap-12 lg:gap-16">
        {/* ---- the form ---- */}
        <div className={`lg:col-span-7 ${tab === "preview" ? "hidden lg:block" : ""}`}>
          <div className="border border-line p-5 sm:p-6 flex items-center justify-between gap-5">
            <div>
              <p className="font-display text-[1.3rem] leading-tight">Show my card when my bracelet is tapped</p>
              <p className="text-[0.92rem] text-muted mt-1.5 max-w-[44ch]">{published ? "On. People who tap your bracelet see the card." : "Off. People only see that your bracelet is genuine."}</p>
            </div>
            <Switch on={published} onChange={() => setPublished((p) => !p)} label="Show my card" />
          </div>

          <div className="mt-12 space-y-14">
            {/* photo */}
            <section>
              <h2 className="font-display text-[1.5rem]">Your photo</h2>
              <p className="text-[0.92rem] text-muted mt-1">Shown on the front of your card.</p>
              <div className="mt-5 flex items-center gap-5">
                <div className="size-24 rounded-full overflow-hidden bg-[var(--c-deep-tint)] ring-1 ring-[var(--c-line)] shrink-0 grid place-items-center">
                  {hasPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element -- the owner's own photo, from a private route
                    <img src={`${base}/photo?v=${ver}`} alt="" className="size-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="size-8 text-[var(--c-text-faint)]" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                      <circle cx="12" cy="9" r="3.6" />
                      <path d="M4.5 20c.8-3.6 3.8-5.6 7.5-5.6s6.7 2 7.5 5.6" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col gap-3 items-start">
                  <div className="flex gap-3 flex-wrap">
                    <button type="button" className="btn-line" disabled={busy} onClick={() => file.current?.click()}>
                      {hasPhoto ? "Change photo" : "Add a photo"}
                    </button>
                    {hasPhoto && (
                      <button type="button" className="btn-text" disabled={busy} onClick={removePhoto}>
                        Remove
                      </button>
                    )}
                  </div>
                  <label className="flex items-center gap-3 text-[0.92rem]">
                    <Switch on={shown.has("photo")} onChange={() => toggle("photo")} disabled={!hasPhoto} label="Show my photo" />
                    {shown.has("photo") && hasPhoto ? "Visible" : "Hidden"}
                  </label>
                  <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
                </div>
              </div>
            </section>

            {SECTIONS.map((sec) => (
              <section key={sec.title}>
                <h2 className="font-display text-[1.5rem]">{sec.title}</h2>
                <p className="text-[0.92rem] text-muted mt-1">{sec.hint}</p>
                <div className="mt-6 space-y-6">
                  {sec.fields.map((f) => {
                    const on = shown.has(f.key) && !!values[f.key].trim();
                    return (
                      <div key={f.key}>
                        <div className="flex items-end justify-between gap-4 mb-2">
                          <label htmlFor={`f-${f.key}`} className="t-eyebrow">
                            {f.label}
                          </label>
                          <label className="flex items-center gap-2.5 text-[0.85rem] text-muted">
                            {on ? "Visible" : "Hidden"}
                            <Switch on={on} onChange={() => toggle(f.key)} disabled={!values[f.key].trim()} label={`Show ${f.label}`} />
                          </label>
                        </div>
                        <div className="relative">
                          {f.prefix && <span aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">{f.prefix}</span>}
                          {f.multiline ? (
                            <textarea
                              id={`f-${f.key}`}
                              className="field !h-auto py-3 leading-snug resize-none"
                              rows={3}
                              maxLength={f.max}
                              value={values[f.key]}
                              placeholder={f.placeholder}
                              disabled={busy}
                              onChange={(e) => type(f.key, e.target.value)}
                            />
                          ) : (
                            <input
                              id={`f-${f.key}`}
                              className={`field !h-[3.2rem] ${f.prefix ? "!pl-9" : ""}`}
                              type={f.type ?? "text"}
                              inputMode={f.inputMode}
                              maxLength={f.max}
                              value={values[f.key]}
                              placeholder={f.placeholder}
                              disabled={busy}
                              autoComplete="off"
                              onChange={(e) => type(f.key, e.target.value)}
                            />
                          )}
                        </div>
                        {f.multiline && <p className="text-[0.78rem] text-faint mt-1.5 text-right tabular-nums">{values[f.key].length}/{f.max}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            <section>
              <h2 className="font-display text-[1.5rem]">Card finish</h2>
              <p className="text-[0.92rem] text-muted mt-1">The colour of your cards.</p>
              <div className="mt-5 grid grid-cols-3 gap-3 max-w-md">
                {FINISHES.map((f) => (
                  <label key={f.key} className="cursor-pointer">
                    <input type="radio" name="finish" className="sr-only peer" checked={cardStyle === f.key} onChange={() => setCardStyle(f.key)} />
                    <span className="block h-16 rounded-[0.6rem] ring-1 ring-[var(--c-line-strong)] peer-checked:ring-2 peer-checked:ring-[var(--c-accent)] peer-focus-visible:outline peer-focus-visible:outline-2 transition-shadow" style={{ background: f.swatch }} />
                    <span className="block text-center text-[0.85rem] mt-2 text-muted peer-checked:text-[var(--c-strong)]">{f.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <p className="text-[0.85rem] text-faint max-w-[56ch] border-t border-line pt-6">
              Anyone who taps your bracelet, or opens its link, can see the details you've switched on. Hidden details are never shown. You can change or switch off your card at any time, and it is erased if you transfer the bracelet or delete your account.
            </p>
          </div>
        </div>

        {/* ---- the preview ---- */}
        <aside className={`lg:col-span-5 ${tab === "edit" ? "hidden lg:block" : ""}`}>
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
            <p className="t-eyebrow text-center mb-6">Live preview</p>
            {empty ? (
              <div className="max-w-[24rem] mx-auto border border-dashed border-line p-10 text-center">
                <p className="font-display text-[1.3rem]">Your card is empty</p>
                <p className="text-[0.95rem] text-muted mt-2">Add a name or switch on a detail, and your card appears here.</p>
              </div>
            ) : (
              <ProfileCard p={preview} braceletId={id} demo photoSrc={`${base}/photo?v=${ver}`} />
            )}
            {!published && !empty && <p className="text-center text-[0.85rem] text-[var(--c-burgundy)] mt-6">Your card is switched off, so people won't see it yet.</p>}
          </div>
        </aside>
      </div>

      {/* ---- save bar ---- */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-[rgb(246_242_236/0.92)] backdrop-blur-md">
        <div className="shell py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p role="status" className="text-[0.92rem]" style={{ color: msg ? (msg.ok ? "var(--c-deep)" : "var(--c-burgundy)") : dirty ? "var(--c-burgundy)" : "var(--c-text-muted)" }}>
            {msg ? msg.text : dirty ? "You have unsaved changes." : "All changes saved."}
          </p>
          <div className="flex items-center gap-5">
            <Link href={`/b/${encodeURIComponent(id)}`} target="_blank" className="btn-text hidden sm:inline-flex">
              See your live page
            </Link>
            <button type="button" className="btn-solid" disabled={busy || !dirty} onClick={save}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
