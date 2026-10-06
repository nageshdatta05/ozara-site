import "server-only";
import { cookies } from "next/headers";
import { db, nowIso } from "./db";
import { createHash, randomBytes } from "node:crypto";
import { hashSecret, sign, unsign, verifySecret } from "./crypto";
import { InputError } from "./bracelets";

/* ==========================================================================
   CUSTOMER ACCOUNTS — real accounts in the site database.
   Passwords are stored as scrypt hashes; the session is a signed, http-only
   cookie that carries the customer id and a session version (bumped on
   password change, so old sessions end).
   Password reset: a single-use, 1-hour token sent by email (server/email.ts).
   Not included: email-address verification (needs the email service live).
   ========================================================================== */

const COOKIE = "ozr_customer";
const DAYS = 30;
const secure = process.env.NODE_ENV === "production";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Customer = { id: number; email: string; name: string; phone: string | null; created_at: string };
type Row = Customer & { password_hash: string; session_version: number };
type Token = { cid: number; v: number; exp: number };

const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function validPassword(pw: string) {
  if (pw.length < 8) throw new InputError("Use at least 8 characters for your password.");
  if (pw.length > 200) throw new InputError("That password is too long.");
}

export function createCustomer(input: { email: unknown; name: unknown; password: unknown; phone?: unknown }): Customer {
  const email = clean(input.email).toLowerCase();
  const name = clean(input.name, 120);
  const password = typeof input.password === "string" ? input.password : "";
  const phone = clean(input.phone, 40) || null;
  if (!EMAIL.test(email)) throw new InputError("Please enter a valid email address.");
  if (!name) throw new InputError("Please tell us your name.");
  validPassword(password);
  const exists = db().prepare("SELECT 1 FROM customers WHERE email = ?").get(email);
  if (exists) throw new InputError("An account with this email already exists. Sign in instead.");
  const now = nowIso();
  const r = db()
    .prepare("INSERT INTO customers (email, name, phone, password_hash, created_at, updated_at) VALUES (?,?,?,?,?,?)")
    .run(email, name, phone, hashSecret(password), now, now);
  return getCustomer(Number(r.lastInsertRowid))!;
}

export function getCustomer(id: number): Customer | undefined {
  const r = db().prepare("SELECT id, email, name, phone, created_at FROM customers WHERE id = ?").get(id) as Customer | undefined;
  // node:sqlite rows have a null prototype; React needs plain objects
  return r ? { id: r.id, email: r.email, name: r.name, phone: r.phone, created_at: r.created_at } : undefined;
}

/** Same answer and similar timing whether the email exists or not. */
export function checkLogin(emailRaw: unknown, password: unknown): Row | null {
  const email = clean(emailRaw).toLowerCase();
  const pw = typeof password === "string" ? password : "";
  const row = db().prepare("SELECT * FROM customers WHERE email = ?").get(email) as Row | undefined;
  const ok = verifySecret(pw, row?.password_hash ?? "scrypt$00$00");
  return row && ok ? row : null;
}

export function updateCustomer(id: number, patch: { name?: unknown; phone?: unknown; email?: unknown }): Customer {
  const cur = getCustomer(id);
  if (!cur) throw new InputError("Account not found.");
  const name = patch.name !== undefined ? clean(patch.name, 120) : cur.name;
  const phone = patch.phone !== undefined ? clean(patch.phone, 40) || null : cur.phone;
  const email = patch.email !== undefined ? clean(patch.email).toLowerCase() : cur.email;
  if (!name) throw new InputError("Please tell us your name.");
  if (!EMAIL.test(email)) throw new InputError("Please enter a valid email address.");
  if (email !== cur.email && db().prepare("SELECT 1 FROM customers WHERE email = ? AND id != ?").get(email, id))
    throw new InputError("Another account already uses this email.");
  db().prepare("UPDATE customers SET name=?, phone=?, email=?, updated_at=? WHERE id=?").run(name, phone, email, nowIso(), id);
  return getCustomer(id)!;
}

export async function changePassword(id: number, current: unknown, next: unknown) {
  const row = db().prepare("SELECT * FROM customers WHERE id = ?").get(id) as Row | undefined;
  if (!row || !verifySecret(typeof current === "string" ? current : "", row.password_hash)) throw new InputError("Your current password is not right.");
  const pw = typeof next === "string" ? next : "";
  validPassword(pw);
  db().prepare("UPDATE customers SET password_hash=?, session_version=session_version+1, updated_at=? WHERE id=?").run(hashSecret(pw), nowIso(), id);
  await startSession({ ...row, session_version: row.session_version + 1 });
}

/* ---- Session ------------------------------------------------------------ */

export async function startSession(row: { id: number; session_version: number }) {
  const token: Token = { cid: row.id, v: row.session_version, exp: Date.now() + DAYS * 864e5 };
  (await cookies()).set(COOKIE, sign(token), { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: DAYS * 86400 });
}

export async function currentCustomer(): Promise<Customer | null> {
  const t = unsign<Token>((await cookies()).get(COOKIE)?.value);
  if (!t) return null;
  const row = db().prepare("SELECT session_version FROM customers WHERE id = ?").get(t.cid) as { session_version: number } | undefined;
  if (!row || row.session_version !== t.v) return null;
  return getCustomer(t.cid) ?? null;
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/* ---- Password reset --------------------------------------------------------- */

const tokenHash = (t: string) => createHash("sha256").update(t).digest("hex");

/** Returns a reset token for the account with this email, or null (caller must not reveal which). */
export function createPasswordReset(emailRaw: unknown): { token: string; customer: Customer } | null {
  const email = clean(emailRaw).toLowerCase();
  if (!EMAIL.test(email)) return null;
  const row = db().prepare("SELECT id FROM customers WHERE email = ?").get(email) as { id: number } | undefined;
  if (!row) return null;
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  db().prepare("INSERT INTO password_resets (customer_id, token_hash, expires_at, created_at) VALUES (?,?,?,?)").run(row.id, tokenHash(token), new Date(now.getTime() + 3600_000).toISOString(), now.toISOString());
  return { token, customer: getCustomer(row.id)! };
}

export function resetTokenValid(token: string): boolean {
  const r = db().prepare("SELECT expires_at, used_at FROM password_resets WHERE token_hash = ?").get(tokenHash(token || "")) as { expires_at: string; used_at: string | null } | undefined;
  return !!r && !r.used_at && new Date(r.expires_at).getTime() > Date.now();
}

/** Set a new password with a valid token; ends every other session and signs this one in. */
export async function resetPassword(token: unknown, password: unknown) {
  const t = typeof token === "string" ? token : "";
  const r = db().prepare("SELECT id, customer_id, expires_at, used_at FROM password_resets WHERE token_hash = ?").get(tokenHash(t)) as
    | { id: number; customer_id: number; expires_at: string; used_at: string | null }
    | undefined;
  if (!r || r.used_at || new Date(r.expires_at).getTime() <= Date.now()) throw new InputError("This reset link has expired or has already been used. Request a new one.");
  const pw = typeof password === "string" ? password : "";
  validPassword(pw);
  const now = nowIso();
  db().prepare("UPDATE customers SET password_hash=?, session_version=session_version+1, updated_at=? WHERE id=?").run(hashSecret(pw), now, r.customer_id);
  db().prepare("UPDATE password_resets SET used_at=? WHERE customer_id=? AND used_at IS NULL").run(now, r.customer_id);
  const row = db().prepare("SELECT id, session_version FROM customers WHERE id = ?").get(r.customer_id) as { id: number; session_version: number };
  await startSession(row);
}

/** Delete the account. Orders are kept for the business record but unlinked; bracelets are released. */
export async function deleteAccount(id: number, password: unknown) {
  const row = db().prepare("SELECT * FROM customers WHERE id = ?").get(id) as Row | undefined;
  if (!row || !verifySecret(typeof password === "string" ? password : "", row.password_hash)) throw new InputError("Your password is not right.");
  const now = nowIso();
  db().exec("BEGIN");
  try {
    db().prepare("UPDATE bracelets SET owner_id=NULL, claimed_at=NULL, owner_visibility='initials', updated_at=? WHERE owner_id IN (SELECT id FROM owners WHERE customer_id=?)").run(now, id);
    db().prepare("DELETE FROM owners WHERE customer_id=?").run(id);
    db().prepare("UPDATE orders SET customer_id=NULL WHERE customer_id=?").run(id);
    db().prepare("DELETE FROM customers WHERE id=?").run(id);
    db().exec("COMMIT");
  } catch (e) {
    db().exec("ROLLBACK");
    throw e;
  }
  await endSession();
}

/** Every account, newest first, with how many bracelets and reservations it has (admin only). */
export type CustomerSummary = { id: number; name: string; email: string; phone: string | null; created_at: string; bracelets: number; orders: number };
export function allCustomers(): CustomerSummary[] {
  const rows = db()
    .prepare(
      `SELECT c.id, c.name, c.email, c.phone, c.created_at,
         (SELECT COUNT(*) FROM bracelets b JOIN owners o ON o.id = b.owner_id WHERE o.customer_id = c.id) AS bracelets,
         (SELECT COUNT(*) FROM orders r WHERE r.customer_id = c.id) AS orders
       FROM customers c ORDER BY c.created_at DESC`
    )
    .all() as CustomerSummary[];
  return rows.map((r) => ({ ...r })); // plain objects for React
}
