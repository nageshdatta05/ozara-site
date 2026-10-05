import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { SCHEMA, SHOP_SCHEMA } from "./schema";
import { seedDemoData } from "./seed";
import { migrate } from "./migrate";

/**
 * DATABASE — SQLite via Node's built-in driver (no extra dependency).
 *
 * The file lives at OZARA_DB_PATH (default: ./data/ozara.db). Everything that
 * touches SQL is in src/server/*; swapping to Postgres later means
 * re-implementing the repository functions in bracelets.ts, nothing else.
 */
declare global {
  // eslint-disable-next-line no-var
  var __ozaraDb: DatabaseSync | undefined;
}

export function db(): DatabaseSync {
  if (globalThis.__ozaraDb) return globalThis.__ozaraDb;
  const file = process.env.OZARA_DB_PATH || path.join(process.cwd(), "data", "ozara.db");
  mkdirSync(path.dirname(file), { recursive: true });
  const conn = new DatabaseSync(file);
  conn.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;");
  conn.exec(SCHEMA);
  conn.exec(SHOP_SCHEMA);
  migrate(conn);
  // Demo records are opt-in (OZARA_SEED_DEMO=true) and always flagged is_demo.
  const { n } = conn.prepare("SELECT COUNT(*) AS n FROM bracelets").get() as { n: number };
  if (n === 0 && process.env.OZARA_SEED_DEMO === "true") seedDemoData(conn);
  // The catalogue was renamed twice (Oct 2026): move bracelets on the old placeholder slugs.
  conn.exec(`UPDATE bracelets SET product_slug = CASE product_slug
      WHEN 'the-signature' THEN 'the-flow' WHEN 'the-essential' THEN 'the-line' WHEN 'the-edition' THEN 'the-wave'
      WHEN 'the-velora' THEN 'the-wave' WHEN 'the-ora' THEN 'the-flow' WHEN 'the-nimbus' THEN 'the-line' END
    WHERE product_slug IN ('the-signature','the-essential','the-edition','the-velora','the-ora','the-nimbus')`);
  globalThis.__ozaraDb = conn;
  return conn;
}

/** Run several statements atomically. */
export function tx<T>(fn: (conn: DatabaseSync) => T): T {
  const conn = db();
  conn.exec("BEGIN");
  try {
    const out = fn(conn);
    conn.exec("COMMIT");
    return out;
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
}

export const nowIso = () => new Date().toISOString();
