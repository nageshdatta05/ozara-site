import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, createHash } from "node:crypto";
import { safeEqual, shortHash, sign, unsign, verifySecret } from "./crypto";
import { eventCodeHashes, getEvent } from "./bracelets";

/* ==========================================================================
   SESSIONS — two separate, signed, http-only cookies:
   • admin     → /admin/nfc  (OZARA_ADMIN_PASSWORD)
   • organiser → /verify     (a per-event organiser code; no admin access)
   ========================================================================== */

const ADMIN_COOKIE = "ozr_admin";
const EVENT_COOKIE = "ozr_event";
const secure = process.env.NODE_ENV === "production";

type AdminToken = { role: "admin"; exp: number };
type EventToken = { eventId: number; sid: string; who: string; exp: number };

/* ---- Brute-force guard (in-memory, per process) ------------------------- */
const attempts = new Map<string, { n: number; until: number }>();
async function clientKey() {
  const h = await headers();
  return shortHash(h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local");
}
export async function tooManyAttempts(scope: string) {
  const k = scope + (await clientKey());
  const a = attempts.get(k);
  return !!a && a.n >= 8 && a.until > Date.now();
}
export async function noteAttempt(scope: string, ok: boolean) {
  const k = scope + (await clientKey());
  if (ok) return attempts.delete(k);
  const a = attempts.get(k);
  const fresh = !a || a.until < Date.now();
  attempts.set(k, { n: fresh ? 1 : a!.n + 1, until: Date.now() + 10 * 60_000 });
}

/* ---- Admin --------------------------------------------------------------- */
export function adminConfigured() {
  return !!process.env.OZARA_ADMIN_PASSWORD;
}

export async function adminLogin(password: string): Promise<boolean> {
  const expected = process.env.OZARA_ADMIN_PASSWORD;
  if (!expected) return false;
  const h = (v: string) => createHash("sha256").update(v).digest("hex");
  if (!safeEqual(h(password), h(expected))) return false;
  (await cookies()).set(ADMIN_COOKIE, sign({ role: "admin", exp: Date.now() + 12 * 3600_000 } satisfies AdminToken), {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 12 * 3600,
  });
  return true;
}

export async function isAdmin(): Promise<boolean> {
  const t = unsign<AdminToken>((await cookies()).get(ADMIN_COOKIE)?.value);
  return t?.role === "admin";
}

/** For pages: bounce to the login screen. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
}

/* ---- Event organiser ------------------------------------------------------ */
export async function organiserLogin(code: string, who: string): Promise<number | null> {
  const match = eventCodeHashes().find((e) => verifySecret(code, e.access_code_hash));
  if (!match) return null;
  const token: EventToken = { eventId: match.id, sid: randomBytes(12).toString("hex"), who: who.trim().slice(0, 60), exp: Date.now() + 18 * 3600_000 };
  (await cookies()).set(EVENT_COOKIE, sign(token), { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 18 * 3600 });
  return match.id;
}

export async function organiserSession() {
  const t = unsign<EventToken>((await cookies()).get(EVENT_COOKIE)?.value);
  if (!t) return null;
  const ev = getEvent(t.eventId);
  if (!ev || ev.status === "ended") return null;
  return { event: ev, sessionHash: shortHash(t.sid), who: t.who || "Door staff" };
}

export async function organiserLogout() {
  (await cookies()).delete(EVENT_COOKIE);
}

/** Coarse, non-identifying device class for logs. */
export async function deviceClass(): Promise<"mobile" | "desktop" | "unknown"> {
  const ua = (await headers()).get("user-agent") || "";
  if (!ua) return "unknown";
  return /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
}
