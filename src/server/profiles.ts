import "server-only";
import { db, nowIso } from "./db";
import { findBracelet, InputError } from "./bracelets";

/* ==========================================================================
   OWNER PROFILES — the page a stranger sees after tapping a bracelet.

   The owner chooses every detail. A field reaches the public page only when
   it has a value AND the owner has switched it on; the whole page appears
   only once the owner publishes it. Values are cleaned here, once, so the
   rest of the site can trust them.
   ========================================================================== */

export const PROFILE_FIELDS = ["name", "headline", "location", "bio", "photo", "phone", "email", "website", "instagram", "linkedin"] as const;
export type ProfileField = (typeof PROFILE_FIELDS)[number];
type TextField = Exclude<ProfileField, "photo">;

export const CARD_STYLES = ["midnight", "burgundy", "ivory"] as const;
export type CardStyle = (typeof CARD_STYLES)[number];

export type OwnerProfile = {
  published: boolean;
  cardStyle: CardStyle;
  values: Record<TextField, string>;
  shown: ProfileField[];
  hasPhoto: boolean;
};

/** What a stranger may see: only switched-on fields that have a value. */
export type PublicProfile = {
  cardStyle: CardStyle;
  name: string | null;
  headline: string | null;
  location: string | null;
  bio: string | null;
  photo: boolean;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  linkedin: string | null;
};

type Row = { published: number; shown: string; card_style: string; updated_at: string } & Record<TextField, string | null>;

const EMPTY: Record<TextField, string> = { name: "", headline: "", location: "", bio: "", phone: "", email: "", website: "", instagram: "", linkedin: "" };
export const MAX_PHOTO_BYTES = 300 * 1024;

const clean = (v: unknown, max: number) =>
  (typeof v === "string" ? v : "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

function cleanPhone(v: unknown) {
  const s = clean(v, 30);
  if (!s) return "";
  if (!/^\+?[0-9 ()-]{7,20}$/.test(s)) throw new InputError("Phone: use digits, with a country code if you like, e.g. +91 98765 43210.");
  return s;
}

function cleanEmail(v: unknown) {
  const s = clean(v, 120);
  if (!s) return "";
  if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(s)) throw new InputError("Email doesn't look right.");
  return s;
}

function cleanWebsite(v: unknown) {
  const s = clean(v, 200);
  if (!s) return "";
  let u: URL;
  try {
    u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`);
  } catch {
    throw new InputError("Website doesn't look right.");
  }
  if ((u.protocol !== "https:" && u.protocol !== "http:") || !u.hostname.includes(".")) throw new InputError("Website must be a web address, e.g. yourname.com.");
  return u.toString();
}

function cleanInstagram(v: unknown) {
  let s = clean(v, 120);
  if (!s) return "";
  s = s.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "").replace(/^@/, "");
  if (!/^[A-Za-z0-9._]{1,30}$/.test(s)) throw new InputError("Instagram: enter your handle, e.g. ozara.co");
  return s;
}

function cleanLinkedin(v: unknown) {
  const s = clean(v, 200);
  if (!s) return "";
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s.replace(/^\/+/, "")}`);
  } catch {
    throw new InputError("LinkedIn: paste your profile link.");
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new InputError("LinkedIn: paste your profile link.");
  if (!/(^|\.)linkedin\.com$/i.test(u.hostname)) throw new InputError("LinkedIn: paste your linkedin.com profile link.");
  return u.toString();
}

const asStyle = (v: unknown): CardStyle => ((CARD_STYLES as readonly string[]).includes(v as string) ? (v as CardStyle) : "midnight");
const isShown = (shown: string, f: ProfileField) => shown.split(",").includes(f);

export function getOwnerProfile(pk: number): OwnerProfile {
  const row = db().prepare("SELECT * FROM profiles WHERE bracelet_pk = ?").get(pk) as Row | undefined;
  const hasPhoto = !!db().prepare("SELECT 1 FROM profile_photos WHERE bracelet_pk = ?").get(pk);
  const values = { ...EMPTY };
  if (row) for (const k of Object.keys(EMPTY) as TextField[]) values[k] = row[k] ?? "";
  const shown = row ? (row.shown.split(",").filter((f) => (PROFILE_FIELDS as readonly string[]).includes(f)) as ProfileField[]) : [];
  return { published: !!row?.published, cardStyle: asStyle(row?.card_style), values, shown, hasPhoto };
}

/** The owner saves their page. Only the owner's own bracelet can be edited. */
export function saveProfile(customerId: number, braceletId: string, input: { published?: unknown; cardStyle?: unknown; values?: Record<string, unknown>; shown?: unknown }) {
  const b = findBracelet(braceletId);
  if (!b || b.owner_customer_id !== customerId) throw new InputError("This bracelet isn't registered to your account.");
  if (b.status === "revoked") throw new InputError("This bracelet has been deactivated by OZARA. Please contact us.");
  const v = input.values ?? {};
  const values: Record<TextField, string> = {
    name: clean(v.name, 60),
    headline: clean(v.headline, 80),
    location: clean(v.location, 60),
    bio: clean(v.bio, 160),
    phone: cleanPhone(v.phone),
    email: cleanEmail(v.email),
    website: cleanWebsite(v.website),
    instagram: cleanInstagram(v.instagram),
    linkedin: cleanLinkedin(v.linkedin),
  };
  const shown = (Array.isArray(input.shown) ? input.shown : []).filter((f): f is ProfileField => (PROFILE_FIELDS as readonly string[]).includes(f as string));
  db()
    .prepare(
      `INSERT INTO profiles (bracelet_pk, published, name, headline, location, bio, phone, email, website, instagram, linkedin, shown, card_style, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(bracelet_pk) DO UPDATE SET published=excluded.published, name=excluded.name, headline=excluded.headline, location=excluded.location, bio=excluded.bio, phone=excluded.phone,
         email=excluded.email, website=excluded.website, instagram=excluded.instagram, linkedin=excluded.linkedin, shown=excluded.shown, card_style=excluded.card_style, updated_at=excluded.updated_at`
    )
    .run(b.id, input.published ? 1 : 0, values.name, values.headline, values.location, values.bio, values.phone, values.email, values.website, values.instagram, values.linkedin, [...new Set(shown)].join(","), asStyle(input.cardStyle), nowIso());
}

/** Store a photo the browser has already cropped and re-encoded as a small JPEG. */
export function savePhoto(customerId: number, braceletId: string, bytes: Uint8Array) {
  const b = findBracelet(braceletId);
  if (!b || b.owner_customer_id !== customerId) throw new InputError("This bracelet isn't registered to your account.");
  if (bytes.length < 200 || bytes.length > MAX_PHOTO_BYTES) throw new InputError("That photo is too large. Try a smaller one.");
  if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) throw new InputError("Please choose a JPEG or PNG photo.");
  db()
    .prepare("INSERT INTO profile_photos (bracelet_pk, jpeg, updated_at) VALUES (?,?,?) ON CONFLICT(bracelet_pk) DO UPDATE SET jpeg=excluded.jpeg, updated_at=excluded.updated_at")
    .run(b.id, bytes, nowIso());
}

export function deletePhoto(customerId: number, braceletId: string) {
  const b = findBracelet(braceletId);
  if (!b || b.owner_customer_id !== customerId) throw new InputError("This bracelet isn't registered to your account.");
  db().prepare("DELETE FROM profile_photos WHERE bracelet_pk = ?").run(b.id);
}

/** The public view of a bracelet's page — null unless the owner has published it. */
export function publicProfile(pk: number): PublicProfile | null {
  const row = db().prepare("SELECT * FROM profiles WHERE bracelet_pk = ? AND published = 1").get(pk) as Row | undefined;
  if (!row) return null;
  const pick = (f: TextField) => (isShown(row.shown, f) && row[f] ? row[f] : null);
  const photo = isShown(row.shown, "photo") && !!db().prepare("SELECT 1 FROM profile_photos WHERE bracelet_pk = ?").get(pk);
  const p: Omit<PublicProfile, "cardStyle"> = {
    name: pick("name"),
    headline: pick("headline"),
    location: pick("location"),
    bio: pick("bio"),
    photo,
    phone: pick("phone"),
    email: pick("email"),
    website: pick("website"),
    instagram: pick("instagram"),
    linkedin: pick("linkedin"),
  };
  return Object.values(p).some(Boolean) ? { ...p, cardStyle: asStyle(row.card_style) } : null;
}

export function publicPhoto(pk: number): Uint8Array | null {
  const row = db().prepare("SELECT shown, published FROM profiles WHERE bracelet_pk = ?").get(pk) as { shown: string; published: number } | undefined;
  if (!row?.published || !isShown(row.shown, "photo")) return null;
  const p = db().prepare("SELECT jpeg FROM profile_photos WHERE bracelet_pk = ?").get(pk) as { jpeg: Uint8Array } | undefined;
  return p?.jpeg ?? null;
}

/** A contact card (vCard 3.0) of what the owner chose to share — the "Save contact" file. */
export function vcard(p: PublicProfile): string | null {
  if (!p.name && !p.phone && !p.email) return null;
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${esc(p.name ?? "OZARA")}`, `N:${esc(p.name ?? "OZARA")};;;;`];
  if (p.headline) lines.push(`TITLE:${esc(p.headline)}`);
  if (p.location) lines.push(`ADR;TYPE=HOME:;;;${esc(p.location)};;;`);
  if (p.bio) lines.push(`NOTE:${esc(p.bio)}`);
  if (p.phone) lines.push(`TEL;TYPE=CELL:${esc(p.phone)}`);
  if (p.email) lines.push(`EMAIL:${esc(p.email)}`);
  if (p.website) lines.push(`URL:${p.website}`);
  if (p.instagram) lines.push(`URL:https://instagram.com/${p.instagram}`);
  if (p.linkedin) lines.push(`URL:${p.linkedin}`);
  lines.push("END:VCARD");
  return lines.join("\r\n") + "\r\n";
}
