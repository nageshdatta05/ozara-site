"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { site } from "@/config/site";
import { Emblem, Wordmark } from "@/components/brand/Emblem";
import { EventVerdict, type Verdict } from "./EventVerdict";

type NDEFRecordLike = { recordType: string; data?: DataView; encoding?: string };
type NDEFReaderLike = { scan: (o?: { signal?: AbortSignal }) => Promise<void>; onreading: ((e: { message: { records: NDEFRecordLike[] } }) => void) | null; onreadingerror: (() => void) | null };

/** Pull the tag's URL (or text) from an NDEF message. */
function urlFromRecords(records: NDEFRecordLike[]): string | null {
  for (const r of records) {
    if (!r.data) continue;
    if (r.recordType === "url" || r.recordType === "absolute-url" || r.recordType === "text") {
      return new TextDecoder(r.encoding || "utf-8").decode(r.data);
    }
  }
  return null;
}

export function Verifier({ event, who }: { event: { name: string } | null; who?: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [manual, setManual] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [count, setCount] = useState(0);
  const [nfc, setNfc] = useState<"unsupported" | "idle" | "listening">("unsupported");
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "NDEFReader" in window) setNfc("idle");
    return () => abort.current?.abort();
  }, []);

  // clear the result automatically so the next guest can be checked
  useEffect(() => {
    if (!verdict) return;
    const t = setTimeout(() => setVerdict(null), verdict.valid ? 4000 : 7000);
    return () => clearTimeout(t);
  }, [verdict]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await fetch("/api/verify/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, name }) }).catch(() => null);
    setBusy(false);
    if (!r) return setError("No connection. Check the network and try again.");
    if (!r.ok) return setError((await r.json().catch(() => ({}))).error ?? "That code isn't valid.");
    router.refresh();
  }

  async function check(input: string) {
    if (!input.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bracelet: input }) });
      const data = await r.json();
      if (!r.ok) return setError(data.error ?? "Could not check this bracelet.");
      setVerdict(data);
      setCount((n) => n + 1);
      setManual("");
      if ("vibrate" in navigator) navigator.vibrate(data.valid ? 60 : [80, 60, 80]);
    } catch {
      setError("No connection. Check the network and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function startNfc() {
    try {
      const Reader = (window as unknown as { NDEFReader: new () => NDEFReaderLike }).NDEFReader;
      const reader = new Reader();
      abort.current = new AbortController();
      await reader.scan({ signal: abort.current.signal });
      setNfc("listening");
      reader.onreading = (e) => {
        const url = urlFromRecords(e.message.records);
        if (url) check(url);
        else setError("This tag doesn't carry a bracelet link.");
      };
      reader.onreadingerror = () => setError("Couldn't read the tag — hold the phone still and try again.");
    } catch {
      setError("NFC permission was declined or is unavailable. Use the bracelet ID instead.");
    }
  }

  async function signOut() {
    abort.current?.abort();
    await fetch("/api/verify/session", { method: "DELETE" });
    router.refresh();
  }

  return (
    <main className="min-h-[100svh] flex flex-col">
      <header className="flex items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-3 text-platinum">
          <Wordmark className="h-[1.2rem]" />
        </div>
        {event && (
          <button type="button" onClick={signOut} className="btn-text !text-[12px]">
            End session
          </button>
        )}
      </header>

      {!event ? (
        <form onSubmit={signIn} className="flex-1 flex flex-col justify-center px-6 max-w-md w-full mx-auto">
          <p className="t-eyebrow">Event verification</p>
          <h1 className="font-display text-[2.4rem] leading-tight mt-3">Check bracelets at the door</h1>
          <p className="t-body mt-4">For event staff. Enter your name and the organiser code for your event. You&rsquo;ll only be able to verify bracelets for that event, and every check is recorded.</p>
          <label htmlFor="staff" className="t-eyebrow mt-10 mb-2">Your name</label>
          <input
            id="staff"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="h-14 px-4 bg-transparent border border-[var(--c-line-strong)] text-[1.05rem] focus:outline-none focus:border-platinum"
          />
          <label htmlFor="code" className="t-eyebrow mt-6 mb-2">Organiser code</label>
          <input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            className="h-14 px-4 bg-transparent border border-[var(--c-line-strong)] text-[1.1rem] tracking-[0.12em] uppercase focus:outline-none focus:border-platinum"
          />
          {error && <p role="alert" className="mt-3 text-[0.97rem] text-[#f0a7b2]">{error}</p>}
          <button type="submit" disabled={busy || !code || !name.trim()} className="btn-solid mt-6 h-14 disabled:opacity-50">
            {busy ? "Checking…" : "Start verifying"}
          </button>
        </form>
      ) : (
        <div className="flex-1 flex flex-col px-6 pb-8 max-w-md w-full mx-auto">
          <div className="mt-10">
            <p className="t-eyebrow">Now verifying</p>
            <h1 className="font-display text-[2rem] leading-tight mt-2">{event.name}</h1>
            <p className="text-[0.875rem] text-faint mt-2 tabular-nums">
              {who ? `${who} · ` : ""}
              {count} checked this session
            </p>
          </div>

          {nfc !== "unsupported" ? (
            <button
              type="button"
              onClick={nfc === "idle" ? startNfc : undefined}
              className="mt-10 aspect-square w-full rounded-full border border-[var(--c-line-strong)] flex flex-col items-center justify-center gap-4"
            >
              <Emblem className={`size-20 text-platinum ${nfc === "listening" ? "animate-pulse" : ""}`} strokeWidth={1.2} />
              <span className="t-eyebrow !text-platinum">{nfc === "listening" ? "Hold a bracelet to the phone" : "Tap to start scanning"}</span>
            </button>
          ) : (
            <div className="mt-10 border border-[var(--c-line)] p-5">
              <p className="t-eyebrow !text-platinum">On iPhone</p>
              <p className="text-[1rem] text-muted mt-2">
                Hold the top of this phone to the bracelet. The bracelet&rsquo;s page opens and shows this event&rsquo;s result.
              </p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              check(manual);
            }}
            className="mt-auto pt-10"
          >
            <label htmlFor="manual" className="t-eyebrow mb-2 block">Or enter the bracelet ID</label>
            <div className="flex gap-2">
              <input
                id="manual"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="BR-000001"
                autoComplete="off"
                autoCapitalize="characters"
                inputMode="text"
                className="flex-1 min-w-0 h-14 px-4 bg-transparent border border-[var(--c-line-strong)] text-[1.05rem] tracking-[0.1em] uppercase placeholder:text-faint focus:outline-none focus:border-platinum"
              />
              <button type="submit" disabled={busy || !manual.trim()} className="btn-solid h-14 disabled:opacity-50">
                Check
              </button>
            </div>
            {error && <p role="alert" className="mt-3 text-[0.97rem] text-[#f0a7b2]">{error}</p>}
          </form>
        </div>
      )}

      <AnimatePresence>{verdict && <EventVerdict v={verdict} onDone={() => setVerdict(null)} />}</AnimatePresence>
    </main>
  );
}
