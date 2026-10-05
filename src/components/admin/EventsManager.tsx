"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "./RegisterForm";
import { Badge } from "@/components/nfc/Badge";

type Ev = { id: number; name: string; starts_at: string | null; venue: string | null; status: "upcoming" | "live" | "ended"; has_code: number; eligible: number };

export function EventsManager({ events }: { events: Ev[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", startsAt: "", venue: "", status: "upcoming", accessCode: "" });
  const [codes, setCodes] = useState<Record<number, string>>({});

  async function call(url: string, method: string, payload: object) {
    setBusy(true);
    setError(null);
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setBusy(false);
    if (!r.ok) {
      setError((await r.json()).error ?? "Something went wrong.");
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <div className="mt-10 grid lg:grid-cols-12 gap-12">
      <section className="lg:col-span-7">
        <ul className="border-t border-[var(--c-ink-line)]">
          {events.map((e) => (
            <li key={e.id} className="py-5 border-b border-[var(--c-ink-line)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[1.05rem]">{e.name}</p>
                  <p className="text-[0.875rem] text-[var(--c-ink-muted)] mt-0.5">
                    {e.starts_at ? new Date(e.starts_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Date to be set"}
                    {e.venue ? ` · ${e.venue}` : ""} · {e.eligible} eligible · {e.has_code ? "organiser code set" : "no organiser code"}
                  </p>
                </div>
                <span className="flex items-center gap-2">
                  <Badge tone={e.status === "live" ? "good" : e.status === "ended" ? "neutral" : "info"}>{e.status}</Badge>
                  <select
                    aria-label={`Status for ${e.name}`}
                    className="field !h-9 !w-auto !text-[0.875rem]"
                    value={e.status}
                    disabled={busy}
                    onChange={(ev) => call(`/api/admin/events/${e.id}`, "PATCH", { status: ev.target.value })}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="ended">Ended</option>
                  </select>
                </span>
              </div>
              <form
                className="mt-3 flex gap-2"
                onSubmit={async (ev) => {
                  ev.preventDefault();
                  if (await call(`/api/admin/events/${e.id}`, "PATCH", { accessCode: codes[e.id] })) setCodes({ ...codes, [e.id]: "" });
                }}
              >
                <input
                  className="field !h-9 !text-[0.92rem] max-w-[16rem]"
                  placeholder={e.has_code ? "Replace organiser code" : "Set organiser code"}
                  value={codes[e.id] ?? ""}
                  onChange={(ev) => setCodes({ ...codes, [e.id]: ev.target.value })}
                  autoComplete="off"
                />
                <button type="submit" className="btn-line !min-h-9 !px-4" disabled={busy || (codes[e.id] ?? "").trim().length < 6}>
                  Save code
                </button>
              </form>
            </li>
          ))}
        </ul>
        {error && <p role="alert" className="mt-4 text-[0.97rem] text-[#8a2130]">{error}</p>}
      </section>

      <section className="lg:col-span-5">
        <h2 className="t-eyebrow !text-[var(--c-ink)]">New event</h2>
        <form
          className="mt-4 border border-[var(--c-ink-line)] p-5 space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await call("/api/admin/events", "POST", { ...f, startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : null });
            if (ok) setF({ name: "", startsAt: "", venue: "", status: "upcoming", accessCode: "" });
          }}
        >
          <Field label="Name">
            <input className="field" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Date & time">
            <input className="field" type="datetime-local" value={f.startsAt} onChange={(e) => setF({ ...f, startsAt: e.target.value })} />
          </Field>
          <Field label="Venue">
            <input className="field" value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} />
          </Field>
          <Field label="Status">
            <select className="field" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
            </select>
          </Field>
          <Field label="Organiser code" hint="Share with door staff. At least 6 characters. Stored only as a hash.">
            <input className="field" value={f.accessCode} onChange={(e) => setF({ ...f, accessCode: e.target.value })} autoComplete="off" />
          </Field>
          <button type="submit" disabled={busy || !f.name.trim()} className="btn-solid disabled:opacity-50">Create event</button>
        </form>
      </section>
    </div>
  );
}
