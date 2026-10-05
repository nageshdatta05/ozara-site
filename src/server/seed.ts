import type { DatabaseSync } from "node:sqlite";
import { hashSecret } from "./crypto";

/**
 * DEMO DATA — only when OZARA_SEED_DEMO=true, and only on an empty database.
 * Every record is flagged is_demo = 1 and is shown publicly as a
 * demonstration, never as a real customer piece. NFC UIDs are placeholders,
 * not real chips. Never enable this in production.
 *
 * Demo claim code for every demo bracelet: OZARA_DEMO_CLAIM_CODE (default DEMO-CLAIM).
 * Demo organiser code for the demo event: OZARA_DEMO_EVENT_CODE (default LAUNCH2026).
 */
export function seedDemoData(conn: DatabaseSync) {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const daysAgo = (n: number) => iso(new Date(now.getTime() - n * 864e5));
  const claim = hashSecret((process.env.OZARA_DEMO_CLAIM_CODE || "DEMO-CLAIM").toUpperCase().replace(/[\s-]+/g, ""));

  conn.exec("BEGIN");
  try {
    const owner = conn
      .prepare("INSERT INTO owners (public_label, display_name, email, created_at) VALUES (?,?,?,?)")
      .run("Demo", "Demo owner (test record)", null, daysAgo(5));

    const eventCode = process.env.OZARA_DEMO_EVENT_CODE || "LAUNCH2026";
    const evA = conn
      .prepare("INSERT INTO events (slug, name, starts_at, venue, status, access_code_hash, is_demo, created_at) VALUES (?,?,?,?,?,?,1,?)")
      .run("launch-evening", "Demo event — Launch Evening", iso(now), "Demo venue", "live", hashSecret(eventCode), daysAgo(10));
    const evB = conn
      .prepare("INSERT INTO events (slug, name, starts_at, venue, status, access_code_hash, is_demo, created_at) VALUES (?,?,?,?,?,?,1,?)")
      .run("private-preview", "Demo event — Private Preview", iso(new Date(now.getTime() + 21 * 864e5)), null, "upcoming", null, daysAgo(10));

    const insert = conn.prepare(
      `INSERT INTO bracelets (bracelet_id, nfc_uid, product_slug, batch, status, owner_id, claimed_at, revoked_reason, notes, claim_code_hash, is_demo, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?)`
    );
    const b1 = insert.run("BR-000001", "04A1B2C3D4E501", "the-flow", "DEMO", "active", null, null, null, "Demo — active, unregistered, eligible for the demo event.", claim, daysAgo(3), daysAgo(3));
    const b2 = insert.run("BR-000002", "04A1B2C3D4E502", "the-wave", "DEMO", "active", owner.lastInsertRowid, daysAgo(2), null, "Demo — active, registered.", claim, daysAgo(3), daysAgo(2));
    const b3 = insert.run("BR-000003", "04A1B2C3D4E503", "the-line", "DEMO", "revoked", null, null, "Deactivated (demo).", "Demo — deactivated.", claim, daysAgo(3), daysAgo(1));
    const b4 = insert.run("BR-000004", "04A1B2C3D4E504", "the-flow", "DEMO", "active", null, null, null, "Demo — active, not eligible for the demo event.", claim, daysAgo(3), daysAgo(3));
    insert.run("BR-000005", "04A1B2C3D4E505", "the-line", "DEMO", "suspended", null, null, "Reported lost (demo).", "Demo — suspended (reported lost).", claim, daysAgo(3), daysAgo(1));

    const elig = conn.prepare("INSERT INTO event_eligibility (bracelet_id, event_id, status, updated_at) VALUES (?,?,?,?)");
    elig.run(b1.lastInsertRowid, evA.lastInsertRowid, "eligible", daysAgo(3));
    elig.run(b2.lastInsertRowid, evA.lastInsertRowid, "eligible", daysAgo(3));
    elig.run(b4.lastInsertRowid, evA.lastInsertRowid, "not_eligible", daysAgo(3));
    elig.run(b4.lastInsertRowid, evB.lastInsertRowid, "eligible", daysAgo(3));
    void b3;
    conn.exec("COMMIT");
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
}
