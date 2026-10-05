import "server-only";
import { db, nowIso } from "./db";
import { findBracelet, getEvent, ID_PATTERN, normaliseId, type BraceletRow } from "./bracelets";
import { products } from "@/data/products";

/* ==========================================================================
   VERIFICATION SERVICE — the only place that decides a bracelet's status.
   Pages and APIs ask this module; nothing in the browser makes the decision.

   Version 1 is IDENTIFICATION + DATABASE VERIFICATION: the tag carries an
   HTTPS URL with the bracelet ID, and the backend checks that ID against the
   register. An NTAG213-class tag can be copied, so this is not cryptographic
   anti-counterfeiting. The `verifyTagProof` hook is where a secure chip
   (e.g. NTAG 424 DNA with SUN/SDM: a per-tap encrypted counter + CMAC in the
   URL) plugs in later — per bracelet, via `verification_method`.
   ========================================================================== */

export type Channel = "public" | "event" | "admin";
export type ScanContext = {
  channel: Channel;
  device?: "mobile" | "desktop" | "unknown";
  /** Hashed, non-personal session id (organiser device), if any. */
  sessionHash?: string | null;
  /** Extra URL parameters from secure chips, e.g. { picc_data, cmac }. */
  proof?: Record<string, string>;
  /** Skip logging (admin preview, link prefetch). */
  dryRun?: boolean;
  /** Event checks: the name the door staff member signed in with. */
  verifiedBy?: string | null;
};

/**
 * What the public may see. Never includes the NFC UID, the owner's name or
 * email — at most the owner's initials, and only if the owner allows it.
 */
export type PublicResult =
  | {
      kind: "authentic";
      braceletId: string;
      productName: string | null;
      productSlug: string | null;
      registered: boolean;
      /** Initials, only when the owner shows them; otherwise null. */
      ownerLabel: string | null;
      registeredSince: string | null;
      issuedAt: string;
      demo: boolean;
      checkedAt: string;
    }
  | { kind: "suspended"; braceletId: string; productName: string | null; demo: boolean; checkedAt: string }
  | { kind: "revoked"; braceletId: string; demo: boolean; checkedAt: string }
  | { kind: "not_recognized"; checkedAt: string };

export type EventResult = {
  /** The single thing a door worker needs. */
  valid: boolean;
  authentic: boolean;
  eligible: boolean;
  reason: "ok" | "not_eligible" | "suspended" | "revoked" | "not_recognized";
  event: { id: number; name: string };
  braceletId: string | null;
  checkedAt: string;
};

/** Accepts a bare ID or a full tag URL (…/b/BR-000001). */
export function extractBraceletId(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return null;
  const m = raw.match(/\/b\/([^/?#]+)/i);
  const id = normaliseId(m ? m[1] : raw);
  return ID_PATTERN.test(id) ? id : null;
}

/** Hook for cryptographic chips. 'url_id' bracelets carry no proof. */
function verifyTagProof(b: BraceletRow, proof: Record<string, string> | undefined): "not_applicable" | "valid" | "invalid" {
  switch (b.verification_method) {
    case "url_id":
      return "not_applicable";
    // case "ntag424_sun":
    //   decrypt proof.picc_data with the key referenced by b.key_ref, check the UID
    //   matches b.nfc_uid, check the counter is higher than the last seen value,
    //   and verify proof.cmac. Return "valid" / "invalid".
    default:
      // Unknown method: never pass silently.
      return "invalid";
  }
}

function lookup(presented: string, ctx: ScanContext) {
  const id = extractBraceletId(presented);
  const b = id ? findBracelet(id) : undefined;
  let result: "authentic" | "suspended" | "revoked" | "not_recognized" = "not_recognized";
  let proofState: string | null = null;
  if (b) {
    const proof = verifyTagProof(b, ctx.proof);
    proofState = proof;
    if (proof === "invalid") result = "not_recognized";
    else result = b.status === "revoked" ? "revoked" : b.status === "suspended" ? "suspended" : "authentic";
  }
  return { id, b, result, proofState };
}

/** Public tap: /b/<id>. */
export function authenticate(presented: string, ctx: ScanContext): PublicResult {
  const { id, b, result, proofState } = lookup(presented, ctx);
  const checkedAt = nowIso();
  if (!ctx.dryRun) record({ presented: id ?? presented.slice(0, 64), b, eventId: null, result, eligibility: null, ctx, proofState });

  if (!b || result === "not_recognized") return { kind: "not_recognized", checkedAt };
  const product = products.find((p) => p.slug === b.product_slug);
  const demo = !!b.is_demo;
  if (result === "revoked") return { kind: "revoked", braceletId: b.bracelet_id, demo, checkedAt };
  if (result === "suspended") return { kind: "suspended", braceletId: b.bracelet_id, productName: product?.name ?? null, demo, checkedAt };
  const registered = !!b.owner_id;
  return {
    kind: "authentic",
    braceletId: b.bracelet_id,
    productName: product?.name ?? null,
    productSlug: product?.slug ?? null,
    registered,
    ownerLabel: registered && b.owner_visibility !== "private" ? b.owner_public_label ?? null : null,
    registeredSince: registered ? b.claimed_at : null,
    issuedAt: b.created_at,
    demo,
    checkedAt,
  };
}

/** Door check: authentic AND eligible for this event. */
export function verifyForEvent(presented: string, eventId: number, ctx: ScanContext): EventResult {
  const ev = getEvent(eventId);
  if (!ev) throw new Error("Event not found");
  const { id, b, result, proofState } = lookup(presented, { ...ctx, channel: "event" });
  const checkedAt = nowIso();
  let eligible = false;
  if (b && result === "authentic") {
    const row = db().prepare("SELECT status FROM event_eligibility WHERE bracelet_id=? AND event_id=?").get(b.id, eventId) as { status: string } | undefined;
    eligible = row?.status === "eligible";
  }
  const reason: EventResult["reason"] = result === "authentic" ? (eligible ? "ok" : "not_eligible") : result;
  if (!ctx.dryRun)
    record({
      presented: id ?? presented.slice(0, 64),
      b,
      eventId,
      result,
      eligibility: result === "authentic" ? (eligible ? "eligible" : "not_eligible") : null,
      ctx: { ...ctx, channel: "event" },
      proofState,
    });
  return {
    valid: result === "authentic" && eligible,
    authentic: result === "authentic",
    eligible,
    reason,
    event: { id: ev.id, name: ev.name },
    braceletId: b && result !== "not_recognized" ? b.bracelet_id : null,
    checkedAt,
  };
}

/* ---- Logging + review rules --------------------------------------------- */

function record(args: {
  presented: string;
  b: BraceletRow | undefined;
  eventId: number | null;
  result: string;
  eligibility: string | null;
  ctx: ScanContext;
  proofState: string | null;
}) {
  const now = nowIso();
  const flag = args.b ? reviewFlag(args.b, args.eventId, args.ctx, args.result) : null;
  db()
    .prepare(
      `INSERT INTO auth_logs (presented_id, bracelet_pk, event_id, channel, result, eligibility, flag, device, session_hash, verified_by, proof, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .run(
      args.presented,
      args.b?.id ?? null,
      args.eventId,
      args.ctx.channel,
      args.result,
      args.eligibility,
      flag ? "review_recommended" : "normal",
      args.ctx.device ?? "unknown",
      args.ctx.sessionHash ?? null,
      args.ctx.verifiedBy ?? null,
      args.proofState,
      now
    );
  if (args.b) {
    db().prepare("UPDATE bracelets SET last_scanned_at=? WHERE id=?").run(now, args.b.id);
    if (flag) db().prepare("UPDATE bracelets SET review_status='review_recommended', review_note=? WHERE id=?").run(flag, args.b.id);
  }
}

/**
 * Unusual-activity rules. They never declare fraud — they ask a human to look.
 * Tune thresholds here as real usage data arrives.
 */
function reviewFlag(b: BraceletRow, eventId: number | null, ctx: ScanContext, result: string): string | null {
  const since = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();

  // 1. A burst of taps in a short window.
  const burst = (db().prepare("SELECT COUNT(*) n FROM auth_logs WHERE bracelet_pk=? AND created_at > ?").get(b.id, since(10)) as { n: number }).n;
  if (burst >= 15) return "Unusually many scans in 10 minutes.";

  if (ctx.channel === "event" && eventId && result === "authentic") {
    // 2. Checked at a different event within a few hours.
    const other = db()
      .prepare("SELECT COUNT(DISTINCT event_id) n FROM auth_logs WHERE bracelet_pk=? AND channel='event' AND result='authentic' AND event_id != ? AND created_at > ?")
      .get(b.id, eventId, since(6 * 60)) as { n: number };
    if (other.n > 0) return "Checked at more than one event within 6 hours.";

    // 3. Admitted at the same event by different door devices within minutes.
    if (ctx.sessionHash) {
      const devices = db()
        .prepare(
          "SELECT COUNT(DISTINCT session_hash) n FROM auth_logs WHERE bracelet_pk=? AND event_id=? AND channel='event' AND session_hash IS NOT NULL AND session_hash != ? AND created_at > ?"
        )
        .get(b.id, eventId, ctx.sessionHash, since(5)) as { n: number };
      if (devices.n > 0) return "Checked by different door devices at the same event within 5 minutes.";
    }
  }
  return null;
}
