import "server-only";
import type { DatabaseSync } from "node:sqlite";

/**
 * In-place upgrades for databases created by earlier versions. Each step is
 * idempotent: it checks the current shape first. Fresh databases already
 * have this shape from schema.ts.
 */
export function migrate(conn: DatabaseSync) {
  const cols = (t: string) => new Set((conn.prepare(`PRAGMA table_info(${t})`).all() as { name: string }[]).map((c) => c.name));
  const add = (t: string, col: string, ddl: string) => {
    if (!cols(t).has(col)) conn.exec(`ALTER TABLE ${t} ADD COLUMN ${col} ${ddl}`);
  };

  // 1. bracelets.status gains 'suspended' (SQLite cannot alter a CHECK: rebuild the table)
  const sql = (conn.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='bracelets'").get() as { sql: string }).sql;
  if (!sql.includes("'suspended'")) {
    const keep = [...cols("bracelets")].join(", ");
    const newSql = sql
      .replace("CREATE TABLE bracelets", "CREATE TABLE bracelets_v2")
      .replace("CREATE TABLE IF NOT EXISTS bracelets", "CREATE TABLE bracelets_v2")
      .replace("CHECK (status IN ('active','revoked'))", "CHECK (status IN ('active','suspended','revoked'))");
    conn.exec("PRAGMA foreign_keys = OFF");
    conn.exec("BEGIN");
    try {
      conn.exec(newSql);
      conn.exec(`INSERT INTO bracelets_v2 (${keep}) SELECT ${keep} FROM bracelets`);
      conn.exec("DROP TABLE bracelets");
      conn.exec("ALTER TABLE bracelets_v2 RENAME TO bracelets");
      conn.exec("COMMIT");
    } catch (e) {
      conn.exec("ROLLBACK");
      throw e;
    } finally {
      conn.exec("PRAGMA foreign_keys = ON");
    }
  }

  // 2. new columns
  add("bracelets", "claim_code_hash", "TEXT");
  add("bracelets", "owner_visibility", "TEXT NOT NULL DEFAULT 'initials'");
  add("bracelets", "is_demo", "INTEGER NOT NULL DEFAULT 0");
  add("bracelets", "order_ref", "TEXT");
  add("owners", "customer_id", "INTEGER");
  add("events", "is_demo", "INTEGER NOT NULL DEFAULT 0");
  add("auth_logs", "verified_by", "TEXT");

  // 3. records created by the old demo seed are demo records — say so
  conn.exec(`UPDATE bracelets SET is_demo = 1 WHERE is_demo = 0 AND notes LIKE 'Demo —%'`);
  conn.exec(`UPDATE events SET is_demo = 1 WHERE is_demo = 0 AND slug IN ('launch-evening','private-preview')`);
}
