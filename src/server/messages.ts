import "server-only";
import { db, nowIso } from "./db";
import { InputError } from "./bracelets";

/* ==========================================================================
   WAITING LIST & CONTACT ENQUIRIES — stored in the site database, listed in
   the admin under Messages.
   ========================================================================== */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function joinWaitlist(input: { email?: unknown; product?: unknown; source?: unknown }): "joined" | "already" {
  const email = s(input.email, 200).toLowerCase();
  if (!EMAIL_RE.test(email)) throw new InputError("Please enter a valid email address.");
  const exists = db().prepare("SELECT 1 FROM waitlist WHERE email = ?").get(email);
  if (exists) return "already";
  db().prepare("INSERT INTO waitlist (email, product, source, created_at) VALUES (?,?,?,?)").run(email, s(input.product, 120) || null, s(input.source, 80) || null, nowIso());
  return "joined";
}

export const TOPICS = ["The collection", "My reservation", "My bracelet", "Clubs & organisations", "Press", "Something else"] as const;

export function createEnquiry(input: { name: unknown; email: unknown; topic: unknown; message: unknown }) {
  const name = s(input.name, 120);
  const email = s(input.email, 200).toLowerCase();
  const topic = s(input.topic, 60);
  const message = s(input.message, 5000);
  if (!name) throw new InputError("Please tell us your name.");
  if (!EMAIL_RE.test(email)) throw new InputError("Please enter a valid email address.");
  if (!TOPICS.includes(topic as (typeof TOPICS)[number])) throw new InputError("Please choose a topic.");
  if (message.length < 10) throw new InputError("Please write a little more so we can help (at least 10 characters).");
  const r = db().prepare("INSERT INTO enquiries (name, email, topic, message, status, created_at) VALUES (?,?,?,?, 'new', ?)").run(name, email, topic, message, nowIso());
  return { id: Number(r.lastInsertRowid), name, email, topic, message };
}

export const listWaitlist = () => db().prepare("SELECT * FROM waitlist ORDER BY id DESC").all() as { id: number; email: string; product: string | null; source: string | null; created_at: string }[];
export const listEnquiries = () =>
  db().prepare("SELECT * FROM enquiries ORDER BY id DESC").all() as { id: number; name: string; email: string; topic: string; message: string; status: string; created_at: string }[];
export const listOutbox = (limit = 50) =>
  db().prepare("SELECT * FROM outbox ORDER BY id DESC LIMIT ?").all(limit) as { id: number; to_email: string; subject: string; kind: string; status: string; error: string | null; created_at: string }[];
export const setEnquiryStatus = (id: number, status: "new" | "answered") => db().prepare("UPDATE enquiries SET status=? WHERE id=?").run(status, id);
