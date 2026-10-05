import "server-only";
import { headers } from "next/headers";
import { shortHash } from "./crypto";

/**
 * Simple per-visitor rate limits for public forms (waiting list, contact,
 * password reset, bracelet registration). In memory, per server process:
 * enough for one server; behind several servers use a shared store (Redis).
 */
const hits = new Map<string, number[]>();

export async function visitorKey() {
  const h = await headers();
  return shortHash(h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local");
}

/** true when this visitor has made `max` requests to `scope` within `windowMs`. */
export async function limited(scope: string, max: number, windowMs: number) {
  const key = scope + ":" + (await visitorKey());
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  return false;
}
