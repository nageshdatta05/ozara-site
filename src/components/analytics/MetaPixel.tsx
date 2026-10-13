"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * META PIXEL — advertising measurement, with consent.
 *
 * Off by default: nothing loads and no banner appears until NEXT_PUBLIC_META_PIXEL_ID is set.
 * Even then, Meta's script is only added after the visitor presses "Accept" in the notice below.
 * "Decline" (or doing nothing) keeps it off. The choice is kept in this browser only.
 * Pages call `pixel("ViewContent", {...})`; it does nothing unless the Pixel is running.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || null;
const KEY = "ozara-ad-cookies";

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[][]; loaded: boolean; version: string; push: Fbq };
declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Events that happen before the visitor has chosen wait here; they are sent on Accept and thrown away on Decline. */
const pending: [string, Record<string, unknown> | undefined][] = [];
let consent: "granted" | "denied" | null | undefined;

function startPixel(id: string) {
  if (window.fbq) return;
  const f = ((...args: unknown[]) => {
    if (f.callMethod) f.callMethod(...args);
    else f.queue.push(args);
  }) as Fbq;
  f.push = f;
  f.loaded = true;
  f.version = "2.0";
  f.queue = [];
  window.fbq = f;
  window._fbq = f;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  window.fbq("init", id);
  window.fbq("track", "PageView");
  for (const [e, p] of pending.splice(0)) window.fbq("track", e, p);
}

/** Report a shopping event (ViewContent, AddToCart, InitiateCheckout, Lead…). A no-op unless the Pixel is running. */
export function pixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !PIXEL_ID || consent === "denied") return;
  if (window.fbq) window.fbq("track", event, params);
  else if (pending.length < 20) pending.push([event, params]);
}

/** Fires one event when it appears on screen — e.g. ViewContent on a product page. */
export function PixelEvent({ name, params }: { name: string; params?: Record<string, unknown> }) {
  const key = JSON.stringify(params ?? null);
  useEffect(() => {
    pixel(name, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key]);
  return null;
}

export function MetaPixel() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<"granted" | "denied" | null | undefined>(undefined);
  const first = useRef(true);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!PIXEL_ID) return;
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* private mode: treat as no choice yet */
    }
    consent = saved === "granted" || saved === "denied" ? saved : null;
    setChoice(consent);
  }, []);

  useEffect(() => {
    if (PIXEL_ID && choice === "granted") startPixel(PIXEL_ID);
  }, [choice]);

  // each page the visitor moves to counts as a page view (the first one is sent when the Pixel starts)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      lastPath.current = pathname;
      return;
    }
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    if (choice === "granted") window.fbq?.("track", "PageView");
  }, [pathname, choice]);

  if (!PIXEL_ID || choice !== null) return null;

  const decide = (c: "granted" | "denied") => {
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* ignore */
    }
    consent = c;
    if (c === "denied") pending.length = 0;
    setChoice(c);
  };

  return (
    <div role="dialog" aria-label="Cookies" className="fixed inset-x-3 bottom-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-[26rem] z-[90] bg-paper border border-[var(--c-line-strong)] p-5 shadow-[0_20px_60px_-20px_rgb(0_7_43/0.35)]">
      <p className="text-[0.92rem] leading-[1.6] text-[var(--c-text-muted)]">
        May we use advertising cookies (Meta) to measure our ads and show them to people who visited? Only if you accept.{" "}
        <Link href="/privacy#cookies" className="underline underline-offset-4 text-[var(--c-strong)]">
          Privacy
        </Link>
      </p>
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={() => decide("granted")} className="btn-solid flex-1">
          Accept
        </button>
        <button type="button" onClick={() => decide("denied")} className="btn-line flex-1">
          Decline
        </button>
      </div>
    </div>
  );
}
