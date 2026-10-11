import "server-only";
import { createHash, randomInt } from "node:crypto";
import { db, nowIso } from "./db";
import { InputError } from "./bracelets";
import { sendEmail } from "./email";
import { getCustomer, type Customer } from "./customers";

/* ==========================================================================
   EMAIL VERIFICATION — a 6-digit code, emailed, typed back.
   The code lives 10 minutes, works once, and is cancelled after 5 wrong
   tries. Only a hash is stored. New codes are limited to one a minute and
   six an hour per account. Until an address is verified, the account can
   shop and reserve, but can't register a bracelet or publish a tap page.
   Set OZARA_REQUIRE_EMAIL_VERIFICATION=false to switch the requirement off.
   ========================================================================== */

const TTL_MS = 10 * 60_000;
const MAX_TRIES = 5;
const RESEND_GAP_MS = 60_000;
const MAX_PER_HOUR = 6;

export const verificationRequired = () => process.env.OZARA_REQUIRE_EMAIL_VERIFICATION !== "false";
/** True when this account may do things that need a proven email address. */
export const mayAct = (c: Pick<Customer, "email_verified">) => c.email_verified || !verificationRequired();

const hash = (customerId: number, code: string) => createHash("sha256").update(`${customerId}:${code}`).digest("hex");

/** Email the customer a fresh code. Returns how long to wait if one was just sent. */
export async function sendVerificationCode(customerId: number): Promise<{ wait?: number }> {
  const c = getCustomer(customerId);
  if (!c) throw new InputError("Account not found.");
  if (c.email_verified) throw new InputError("Your email is already verified.");

  const recent = db().prepare("SELECT created_at FROM email_codes WHERE customer_id = ? ORDER BY id DESC LIMIT 1").get(customerId) as { created_at: string } | undefined;
  if (recent) {
    const since = Date.now() - new Date(recent.created_at).getTime();
    if (since < RESEND_GAP_MS) return { wait: Math.ceil((RESEND_GAP_MS - since) / 1000) };
  }
  const hour = (db().prepare("SELECT COUNT(*) AS n FROM email_codes WHERE customer_id = ? AND created_at > ?").get(customerId, new Date(Date.now() - 3600_000).toISOString()) as { n: number }).n;
  if (hour >= MAX_PER_HOUR) throw new InputError("Too many codes requested. Please try again in an hour.");

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const now = nowIso();
  db().prepare("UPDATE email_codes SET used_at = ? WHERE customer_id = ? AND used_at IS NULL").run(now, customerId); // older codes stop working
  db().prepare("INSERT INTO email_codes (customer_id, code_hash, expires_at, created_at) VALUES (?,?,?,?)").run(customerId, hash(customerId, code), new Date(Date.now() + TTL_MS).toISOString(), now);

  const sent = await sendEmail({
    to: c.email,
    subject: `${code} is your OZARA verification code`,
    text: `Your OZARA verification code is ${code}\n\nIt expires in 10 minutes. If you didn't create an OZARA account, you can ignore this email.`,
    kind: "verify",
    sensitive: true,
  });
  // in development the code is printed to the server console instead; in production a failed send must be said
  if (!sent && process.env.NODE_ENV === "production") throw new InputError("We couldn't send the email just now. Please try again in a moment.");
  return {};
}

/** Check the code the customer typed. */
export function confirmVerificationCode(customerId: number, raw: unknown) {
  const code = (typeof raw === "string" ? raw : "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) throw new InputError("Enter the 6-digit code from the email.");
  const row = db()
    .prepare("SELECT id, code_hash, expires_at, attempts FROM email_codes WHERE customer_id = ? AND used_at IS NULL ORDER BY id DESC LIMIT 1")
    .get(customerId) as { id: number; code_hash: string; expires_at: string; attempts: number } | undefined;
  if (!row || new Date(row.expires_at).getTime() < Date.now()) throw new InputError("That code has expired. Request a new one.");
  if (row.attempts >= MAX_TRIES) throw new InputError("Too many wrong tries. Request a new code.");
  if (row.code_hash !== hash(customerId, code)) {
    db().prepare("UPDATE email_codes SET attempts = attempts + 1 WHERE id = ?").run(row.id);
    const left = MAX_TRIES - row.attempts - 1;
    throw new InputError(left > 0 ? `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.` : "Too many wrong tries. Request a new code.");
  }
  const now = nowIso();
  db().prepare("UPDATE email_codes SET used_at = ? WHERE customer_id = ? AND used_at IS NULL").run(now, customerId);
  db().prepare("UPDATE customers SET email_verified_at = ?, updated_at = ? WHERE id = ?").run(now, now, customerId);
}
