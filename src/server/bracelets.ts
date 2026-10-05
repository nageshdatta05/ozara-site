import "server-only";
import { db, nowIso, tx } from "./db";
import { randomBytes } from "node:crypto";
import { hashSecret, verifySecret } from "./crypto";

/* ==========================================================================
   REPOSITORY — every read and write of bracelet data goes through here.
   ========================================================================== */

export type BraceletRow = {
  id: number;
  bracelet_id: string;
  nfc_uid: string | null;
  verification_method: string;
  product_slug: string | null;
  batch: string | null;
  status: "active" | "suspended" | "revoked";
  owner_id: number | null;
  claimed_at: string | null;
  revoked_reason: string | null;
  review_status: "normal" | "review_recommended";
  review_note: string | null;
  notes: string | null;
  claim_code_hash: string | null;
  owner_visibility: "initials" | "private";
  is_demo: number;
  order_ref: string | null;
  created_at: string;
  updated_at: string;
  last_scanned_at: string | null;
  owner_public_label?: string | null;
  owner_display_name?: string | null;
  owner_customer_id?: number | null;
  eligible_events?: number;
};

export type EventRow = {
  id: number;
  slug: string;
  name: string;
  starts_at: string | null;
  venue: string | null;
  status: "upcoming" | "live" | "ended";
  has_code: number;
  is_demo: number;
  created_at: string;
};

export type LogRow = {
  id: number;
  presented_id: string;
  bracelet_pk: number | null;
  event_id: number | null;
  event_name: string | null;
  channel: "public" | "event" | "admin";
  result: "authentic" | "suspended" | "revoked" | "not_recognized";
  eligibility: "eligible" | "not_eligible" | null;
  flag: "normal" | "review_recommended";
  device: string | null;
  verified_by: string | null;
  created_at: string;
};

/** Display status used across admin — derived, never stored. */
export type DisplayStatus = "Registered" | "Unregistered" | "Suspended" | "Revoked";
export const displayStatus = (b: Pick<BraceletRow, "status" | "owner_id">): DisplayStatus =>
  b.status === "revoked" ? "Revoked" : b.status === "suspended" ? "Suspended" : b.owner_id ? "Registered" : "Unregistered";

/** Identifiers are case-insensitive on input and stored upper-case. */
export const normaliseId = (raw: string) => decodeURIComponent(raw).trim().toUpperCase();
export const ID_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,39}$/; // input hygiene only — NOT an authenticity check
export const UID_PATTERN = /^[0-9A-F]{8,20}$/;

const BRACELET_SELECT = `
  SELECT b.*, o.public_label AS owner_public_label, o.display_name AS owner_display_name, o.customer_id AS owner_customer_id,
    (SELECT COUNT(*) FROM event_eligibility e WHERE e.bracelet_id = b.id AND e.status = 'eligible') AS eligible_events
  FROM bracelets b LEFT JOIN owners o ON o.id = b.owner_id`;

export function findBracelet(braceletId: string): BraceletRow | undefined {
  return db().prepare(`${BRACELET_SELECT} WHERE b.bracelet_id = ?`).get(normaliseId(braceletId)) as BraceletRow | undefined;
}

export function listBracelets(opts: { q?: string; status?: string } = {}): BraceletRow[] {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (opts.q) {
    const like = `%${opts.q.trim()}%`;
    where.push("(b.bracelet_id LIKE ? OR IFNULL(b.nfc_uid,'') LIKE ? OR IFNULL(o.display_name,'') LIKE ? OR IFNULL(o.public_label,'') LIKE ? OR IFNULL(b.batch,'') LIKE ?)");
    args.push(like, like, like, like, like);
  }
  switch (opts.status) {
    case "active":
      where.push("b.status = 'active'");
      break;
    case "claimed":
      where.push("b.status = 'active' AND b.owner_id IS NOT NULL");
      break;
    case "unclaimed":
      where.push("b.status = 'active' AND b.owner_id IS NULL");
      break;
    case "suspended":
      where.push("b.status = 'suspended'");
      break;
    case "revoked":
      where.push("b.status = 'revoked'");
      break;
    case "review":
      where.push("b.review_status = 'review_recommended'");
      break;
  }
  const sql = `${BRACELET_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY b.bracelet_id`;
  return db().prepare(sql).all(...args) as BraceletRow[];
}

export function stats() {
  const q = (sql: string) => (db().prepare(sql).get() as { n: number }).n;
  return {
    total: q("SELECT COUNT(*) n FROM bracelets"),
    active: q("SELECT COUNT(*) n FROM bracelets WHERE status='active'"),
    unclaimed: q("SELECT COUNT(*) n FROM bracelets WHERE status='active' AND owner_id IS NULL"),
    claimed: q("SELECT COUNT(*) n FROM bracelets WHERE status='active' AND owner_id IS NOT NULL"),
    suspended: q("SELECT COUNT(*) n FROM bracelets WHERE status='suspended'"),
    revoked: q("SELECT COUNT(*) n FROM bracelets WHERE status='revoked'"),
    eventEligible: q("SELECT COUNT(DISTINCT e.bracelet_id) n FROM event_eligibility e JOIN bracelets b ON b.id=e.bracelet_id WHERE e.status='eligible' AND b.status='active'"),
    review: q("SELECT COUNT(*) n FROM bracelets WHERE review_status='review_recommended'"),
  };
}

const LOG_SELECT = `SELECT l.*, ev.name AS event_name FROM auth_logs l LEFT JOIN events ev ON ev.id = l.event_id`;

export function recentLogs(limit = 12): LogRow[] {
  return db().prepare(`${LOG_SELECT} ORDER BY l.id DESC LIMIT ?`).all(limit) as LogRow[];
}

export function logsForBracelet(pk: number, limit = 100): LogRow[] {
  return db().prepare(`${LOG_SELECT} WHERE l.bracelet_pk = ? ORDER BY l.id DESC LIMIT ?`).all(pk, limit) as LogRow[];
}

export function eligibilityFor(pk: number) {
  return db()
    .prepare(
      `SELECT ev.id AS event_id, ev.name, ev.status AS event_status, ev.starts_at, e.status
       FROM events ev LEFT JOIN event_eligibility e ON e.event_id = ev.id AND e.bracelet_id = ?
       ORDER BY ev.starts_at IS NULL, ev.starts_at DESC`
    )
    .all(pk) as { event_id: number; name: string; event_status: string; starts_at: string | null; status: "eligible" | "not_eligible" | null }[];
}

/* ---- Writes -------------------------------------------------------------- */

export class InputError extends Error {}

export function createBracelet(input: {
  braceletId: string;
  nfcUid?: string | null;
  productSlug?: string | null;
  batch?: string | null;
  status?: "active" | "revoked";
  notes?: string | null;
  eligibleEventIds?: number[];
  orderRef?: string | null;
}): BraceletRow & { claimCode: string } {
  const braceletId = normaliseId(input.braceletId);
  if (!ID_PATTERN.test(braceletId)) throw new InputError("Bracelet ID: 3–40 characters, letters, numbers and hyphens.");
  const uid = input.nfcUid ? input.nfcUid.replace(/[\s:]/g, "").toUpperCase() : null;
  if (uid && !UID_PATTERN.test(uid)) throw new InputError("NFC UID: hexadecimal, e.g. 04A1B2C3D4E5F6.");
  if (findBracelet(braceletId)) throw new InputError(`${braceletId} is already registered.`);
  if (uid && db().prepare("SELECT 1 FROM bracelets WHERE nfc_uid = ?").get(uid)) throw new InputError(`NFC UID ${uid} is already assigned to another bracelet.`);

  const claimCode = newClaimCode();
  return tx((conn) => {
    const now = nowIso();
    const r = conn
      .prepare(
        `INSERT INTO bracelets (bracelet_id, nfc_uid, product_slug, batch, status, notes, claim_code_hash, order_ref, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)`
      )
      .run(braceletId, uid, input.productSlug || null, input.batch || null, input.status ?? "active", input.notes || null, hashSecret(normCode(claimCode)), input.orderRef?.trim().toUpperCase() || null, now, now);
    for (const ev of input.eligibleEventIds ?? []) {
      conn.prepare("INSERT INTO event_eligibility (bracelet_id, event_id, status, updated_at) VALUES (?,?,?,?)").run(r.lastInsertRowid, ev, "eligible", now);
    }
    return { ...findBracelet(braceletId)!, claimCode };
  });
}

/** Only mutable fields. bracelet_id is permanent; nfc_uid can be set once. */
export function updateBracelet(braceletId: string, patch: { nfcUid?: string | null; productSlug?: string | null; batch?: string | null; notes?: string | null }) {
  const b = findBracelet(braceletId);
  if (!b) throw new InputError("Bracelet not found.");
  let uid = b.nfc_uid;
  if (patch.nfcUid !== undefined && patch.nfcUid) {
    const next = patch.nfcUid.replace(/[\s:]/g, "").toUpperCase();
    if (b.nfc_uid && b.nfc_uid !== next) throw new InputError("The NFC UID is permanent once recorded.");
    if (!UID_PATTERN.test(next)) throw new InputError("NFC UID: hexadecimal, e.g. 04A1B2C3D4E5F6.");
    uid = next;
  }
  db()
    .prepare("UPDATE bracelets SET nfc_uid=?, product_slug=?, batch=?, notes=?, updated_at=? WHERE id=?")
    .run(uid, patch.productSlug ?? b.product_slug, patch.batch ?? b.batch, patch.notes ?? b.notes, nowIso(), b.id);
  return findBracelet(braceletId)!;
}

export function setStatus(braceletId: string, status: BraceletRow["status"], reason?: string | null) {
  const b = findBracelet(braceletId);
  if (!b) throw new InputError("Bracelet not found.");
  db()
    .prepare("UPDATE bracelets SET status=?, revoked_reason=?, updated_at=? WHERE id=?")
    .run(status, status === "active" ? null : reason || null, nowIso(), b.id);
  return findBracelet(braceletId)!;
}

/* ---- Claim codes & ownership (customer side) --------------------------------
   A claim code is printed on the card in the box. Whoever holds the bracelet
   and its card can register it to their account. Only a hash is stored. */

const CODE_ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newClaimCode() {
  const b = randomBytes(8);
  const c = Array.from(b, (x) => CODE_ABC[x % CODE_ABC.length]).join("");
  return `${c.slice(0, 4)}-${c.slice(4)}`;
}
/** Codes are compared without spaces or hyphens, case-insensitively. */
export const normCode = (c: string) => c.trim().toUpperCase().replace(/[\s-]+/g, "");

/** Admin: issue a fresh claim code (the old one stops working). */
export function resetClaimCode(braceletId: string): string {
  const b = findBracelet(braceletId);
  if (!b) throw new InputError("Bracelet not found.");
  const code = newClaimCode();
  db().prepare("UPDATE bracelets SET claim_code_hash=?, updated_at=? WHERE id=?").run(hashSecret(normCode(code)), nowIso(), b.id);
  return code;
}

export function braceletsForCustomer(customerId: number): BraceletRow[] {
  return db().prepare(`${BRACELET_SELECT} WHERE o.customer_id = ? ORDER BY b.claimed_at DESC`).all(customerId) as BraceletRow[];
}

/** Register a bracelet to a customer, proving possession with its claim code. */
export function claimBracelet(customer: { id: number; name: string }, braceletIdRaw: string, codeRaw: string): BraceletRow {
  const generic = "That bracelet ID and claim code don't match. Check the card that came with your piece.";
  const id = normaliseId(braceletIdRaw || "");
  if (!ID_PATTERN.test(id) || !codeRaw?.trim()) throw new InputError(generic);
  const b = findBracelet(id);
  if (!b || !verifySecret(normCode(codeRaw), b.claim_code_hash)) throw new InputError(generic);
  if (b.status === "revoked") throw new InputError("This bracelet has been deactivated and can't be registered. Please contact us.");
  if (b.owner_id) {
    if (b.owner_customer_id === customer.id) throw new InputError("This bracelet is already registered to you.");
    throw new InputError("This bracelet is already registered to another owner. If it has been passed to you, ask them to transfer it from their account.");
  }
  const initials = customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((w) => w[0]!.toUpperCase() + ".")
    .join(" ");
  tx((conn) => {
    const now = nowIso();
    const o = conn.prepare("INSERT INTO owners (public_label, display_name, email, customer_id, created_at) VALUES (?,?,NULL,?,?)").run(initials || null, customer.name, customer.id, now);
    conn.prepare("UPDATE bracelets SET owner_id=?, claimed_at=?, owner_visibility='initials', updated_at=? WHERE id=?").run(o.lastInsertRowid, now, now, b.id);
  });
  return findBracelet(id)!;
}

function ownedBy(customerId: number, braceletId: string) {
  const b = findBracelet(braceletId);
  if (!b || b.owner_customer_id !== customerId) throw new InputError("This bracelet isn't registered to your account.");
  return b;
}

export function setOwnerVisibility(customerId: number, braceletId: string, visibility: "initials" | "private") {
  const b = ownedBy(customerId, braceletId);
  db().prepare("UPDATE bracelets SET owner_visibility=?, updated_at=? WHERE id=?").run(visibility === "private" ? "private" : "initials", nowIso(), b.id);
}

/** The owner reports it lost (suspends it) or found (reactivates — only if they suspended it). */
export function setLost(customerId: number, braceletId: string, lost: boolean) {
  const b = ownedBy(customerId, braceletId);
  if (b.status === "revoked") throw new InputError("This bracelet has been deactivated by OZARA. Please contact us.");
  if (lost) {
    db().prepare("UPDATE bracelets SET status='suspended', revoked_reason='Reported lost by owner', updated_at=? WHERE id=?").run(nowIso(), b.id);
  } else {
    if (b.status === "suspended" && b.revoked_reason !== "Reported lost by owner") throw new InputError("This bracelet was suspended by OZARA. Please contact us.");
    db().prepare("UPDATE bracelets SET status='active', revoked_reason=NULL, updated_at=? WHERE id=?").run(nowIso(), b.id);
  }
}

/**
 * Transfer: the owner releases the bracelet and receives a NEW claim code to
 * hand to the next owner. The old code stops working.
 */
export function releaseBracelet(customerId: number, braceletId: string): string {
  const b = ownedBy(customerId, braceletId);
  const code = newClaimCode();
  db().prepare("UPDATE bracelets SET owner_id=NULL, claimed_at=NULL, owner_visibility='initials', claim_code_hash=?, updated_at=? WHERE id=?").run(hashSecret(normCode(code)), nowIso(), b.id);
  return code;
}

export function clearReview(braceletId: string) {
  const b = findBracelet(braceletId);
  if (!b) throw new InputError("Bracelet not found.");
  db().prepare("UPDATE bracelets SET review_status='normal', review_note=NULL, updated_at=? WHERE id=?").run(nowIso(), b.id);
}

export function setEligibility(braceletId: string, eventId: number, status: "eligible" | "not_eligible" | null) {
  const b = findBracelet(braceletId);
  if (!b) throw new InputError("Bracelet not found.");
  if (status === null) {
    db().prepare("DELETE FROM event_eligibility WHERE bracelet_id=? AND event_id=?").run(b.id, eventId);
  } else {
    db()
      .prepare(
        `INSERT INTO event_eligibility (bracelet_id, event_id, status, updated_at) VALUES (?,?,?,?)
         ON CONFLICT(bracelet_id, event_id) DO UPDATE SET status=excluded.status, updated_at=excluded.updated_at`
      )
      .run(b.id, eventId, status, nowIso());
  }
}

/** Link an owner (claim). Public pages show only `public_label`. */
export function assignOwner(braceletId: string, owner: { displayName: string; publicLabel?: string | null; email?: string | null } | null) {
  const b = findBracelet(braceletId);
  if (!b) throw new InputError("Bracelet not found.");
  tx((conn) => {
    const now = nowIso();
    if (!owner) {
      conn.prepare("UPDATE bracelets SET owner_id=NULL, claimed_at=NULL, updated_at=? WHERE id=?").run(now, b.id);
      return;
    }
    const o = conn
      .prepare("INSERT INTO owners (public_label, display_name, email, created_at) VALUES (?,?,?,?)")
      .run(owner.publicLabel || null, owner.displayName, owner.email || null, now);
    conn.prepare("UPDATE bracelets SET owner_id=?, claimed_at=?, updated_at=? WHERE id=?").run(o.lastInsertRowid, now, now, b.id);
  });
}

/* ---- Events ---------------------------------------------------------------- */

export function listEvents(): EventRow[] {
  return db()
    .prepare("SELECT id, slug, name, starts_at, venue, status, (access_code_hash IS NOT NULL) AS has_code, is_demo, created_at FROM events ORDER BY starts_at IS NULL, starts_at DESC")
    .all() as EventRow[];
}

export function getEvent(id: number): EventRow | undefined {
  return db()
    .prepare("SELECT id, slug, name, starts_at, venue, status, (access_code_hash IS NOT NULL) AS has_code, is_demo, created_at FROM events WHERE id=?")
    .get(id) as EventRow | undefined;
}

export function eventCodeHashes() {
  return db().prepare("SELECT id, access_code_hash FROM events WHERE access_code_hash IS NOT NULL AND status != 'ended'").all() as {
    id: number;
    access_code_hash: string;
  }[];
}

export function createEvent(input: { name: string; startsAt?: string | null; venue?: string | null; status?: EventRow["status"]; accessCode?: string | null }) {
  const name = input.name.trim();
  if (!name) throw new InputError("Event name is required.");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6);
  if (input.accessCode && input.accessCode.trim().length < 6) throw new InputError("Organiser code: at least 6 characters.");
  const r = db()
    .prepare("INSERT INTO events (slug, name, starts_at, venue, status, access_code_hash, created_at) VALUES (?,?,?,?,?,?,?)")
    .run(slug, name, input.startsAt || null, input.venue || null, input.status ?? "upcoming", input.accessCode ? hashSecret(input.accessCode) : null, nowIso());
  return getEvent(Number(r.lastInsertRowid))!;
}

export function updateEvent(id: number, patch: { status?: EventRow["status"]; accessCode?: string | null }) {
  const ev = getEvent(id);
  if (!ev) throw new InputError("Event not found.");
  if (patch.status) db().prepare("UPDATE events SET status=? WHERE id=?").run(patch.status, id);
  if (patch.accessCode) {
    if (patch.accessCode.trim().length < 6) throw new InputError("Organiser code: at least 6 characters.");
    db().prepare("UPDATE events SET access_code_hash=? WHERE id=?").run(hashSecret(patch.accessCode), id);
  }
  return getEvent(id)!;
}
