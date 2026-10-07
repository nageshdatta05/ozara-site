import "server-only";
import { headers } from "next/headers";
import { shortHash } from "./crypto";

/**
 * Simple per-visitor rate limits for public forms (waiting list, contact,
 * password reset, bracelet registration). In memory, per server process:
 * enough for one server; behind several servers use a shared store (Redis).
 */
const hits = new Map<string, number[]>();
// The longest window any caller uses is well under a day; drop stale visitors so
// the map can't grow forever.
const MAX_WINDOW_MS = 24 * 3600_000;
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 10 * 60_000) return;
  lastSweep = now;
  for (const [k, list] of hits) if (!list.length || now - list[list.length - 1] > MAX_WINDOW_MS) hits.delete(k);
}

export async function visitorKey() {
  const h = await headers();
  return shortHash(h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local");
}

/** true when this visitor has made `max` requests to `scope` within `windowMs`. */
export async function limited(scope: string, max: number, windowMs: number) {
  const key = scope + ":" + (await visitorKey());
  const now = Date.now();
  sweep(now);
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  return false;
}
