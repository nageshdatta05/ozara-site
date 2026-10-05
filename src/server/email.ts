import "server-only";
import { db, nowIso } from "./db";

/* ==========================================================================
   EMAIL — sent through Resend (https://resend.com) when configured:
     RESEND_API_KEY   — API key (server only)
     EMAIL_FROM       — e.g. "OZARA <hello@ozara.co>" on a verified domain
     OZARA_INBOX_EMAIL — where contact enquiries and new reservations go
   Without a key, nothing is sent: the attempt is recorded in the outbox
   table as "not_configured" (and, in development, printed to the server
   console so flows can be tested). Every attempt is recorded; the bodies of
   security emails (password resets) are never stored.
   ========================================================================== */

export type Mail = { to: string; subject: string; text: string; kind: string; sensitive?: boolean };

export const emailConfigured = () => !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
export const inbox = () => process.env.OZARA_INBOX_EMAIL || null;

function record(m: Mail, status: string, error?: string) {
  try {
    db().prepare("INSERT INTO outbox (to_email, subject, kind, status, error, created_at) VALUES (?,?,?,?,?,?)").run(m.to, m.subject, m.kind, status, error ?? null, nowIso());
  } catch {
    /* never let logging break the request */
  }
}

export async function sendEmail(m: Mail): Promise<boolean> {
  if (!emailConfigured()) {
    record(m, "not_configured");
    if (process.env.NODE_ENV !== "production") {
      console.info(`\n[email:not-configured] to=${m.to} subject="${m.subject}"\n${m.text}\n`);
    }
    return false;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [m.to], subject: m.subject, text: m.text }),
    });
    if (!r.ok) {
      record(m, "failed", `HTTP ${r.status}`);
      return false;
    }
    record(m, "sent");
    return true;
  } catch (e) {
    record(m, "failed", (e as Error).message.slice(0, 200));
    return false;
  }
}
