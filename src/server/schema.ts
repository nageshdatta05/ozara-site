/**
 * Schema. Two ideas are kept deliberately separate:
 *   1. AUTHENTICITY  — is this a bracelet we issued, and is it still valid?
 *                      (bracelets.status, bracelets.owner_id)
 *   2. EVENT ACCESS  — is this bracelet admitted to a particular event?
 *                      (event_eligibility)
 * A bracelet can be authentic and still not eligible for a given event.
 */
export const SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS owners (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  -- what may be shown publicly, e.g. "A. R." — never the full name or email
  public_label    TEXT,
  display_name    TEXT NOT NULL,
  email           TEXT,
  -- the customer account behind this owner, when the bracelet was registered online
  customer_id     INTEGER,
  created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bracelets (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  -- PERMANENT: the identifier written into the NFC tag URL (/b/<bracelet_id>)
  bracelet_id         TEXT NOT NULL UNIQUE,
  -- PERMANENT once set: the chip's factory UID, read with an NFC tool at registration
  nfc_uid             TEXT UNIQUE,
  -- how authenticity is established: 'url_id' today; e.g. 'ntag424_sun' later
  verification_method TEXT NOT NULL DEFAULT 'url_id',
  -- secret material reference for cryptographic chips (never the key itself)
  key_ref             TEXT,
  product_slug        TEXT,
  batch               TEXT,
  -- lifecycle: 'active' | 'suspended' (e.g. reported lost — reversible) | 'revoked' (permanently deactivated)
  -- registered/unregistered is derived from owner_id
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','revoked')),
  owner_id            INTEGER REFERENCES owners(id),
  claimed_at          TEXT,
  revoked_reason      TEXT,
  -- 'normal' | 'review_recommended' — never an automatic fraud verdict
  review_status       TEXT NOT NULL DEFAULT 'normal' CHECK (review_status IN ('normal','review_recommended')),
  review_note         TEXT,
  notes               TEXT,
  -- the owner proves possession with this code (printed on the card in the box); only a hash is stored
  claim_code_hash     TEXT,
  -- what the public page may show about the owner: 'initials' | 'private'
  owner_visibility    TEXT NOT NULL DEFAULT 'initials',
  -- 1 = demonstration/test record, never a real customer piece (shown as such publicly)
  is_demo             INTEGER NOT NULL DEFAULT 0,
  -- optional link to the order it was made for
  order_ref           TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL,
  last_scanned_at     TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  starts_at       TEXT,
  venue           TEXT,
  status          TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','live','ended')),
  -- organisers sign in to /verify with this code; only a hash is stored
  access_code_hash TEXT,
  is_demo         INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS event_eligibility (
  bracelet_id     INTEGER NOT NULL REFERENCES bracelets(id) ON DELETE CASCADE,
  event_id        INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status          TEXT NOT NULL CHECK (status IN ('eligible','not_eligible')),
  updated_at      TEXT NOT NULL,
  PRIMARY KEY (bracelet_id, event_id)
);

CREATE TABLE IF NOT EXISTS auth_logs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  -- exactly what was presented (kept even when unknown, for review)
  presented_id    TEXT NOT NULL,
  bracelet_pk     INTEGER REFERENCES bracelets(id) ON DELETE SET NULL,
  event_id        INTEGER REFERENCES events(id) ON DELETE SET NULL,
  channel         TEXT NOT NULL CHECK (channel IN ('public','event','admin')),
  -- 'authentic' | 'revoked' | 'not_recognized'
  result          TEXT NOT NULL,
  -- for event checks: 'eligible' | 'not_eligible'
  eligibility     TEXT,
  -- 'normal' | 'review_recommended'
  flag            TEXT NOT NULL DEFAULT 'normal',
  -- non-personal context: device class and a hashed session id (no IP, no name)
  device          TEXT,
  session_hash    TEXT,
  -- for event checks: the name the door staff member signed in with
  verified_by     TEXT,
  proof           TEXT,
  created_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_logs_bracelet ON auth_logs (bracelet_pk, created_at);
CREATE INDEX IF NOT EXISTS idx_logs_created  ON auth_logs (created_at);
`;

/**
 * Customers and orders — the shop. Kept apart from bracelet ownership
 * (owners) on purpose: a customer becomes an owner only when a bracelet is
 * registered to them.
 */
export const SHOP_SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS customers (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name            TEXT NOT NULL,
  phone           TEXT,
  password_hash   TEXT NOT NULL,
  -- bumped on password change / "sign out everywhere": old cookies stop working
  session_version INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  reference       TEXT NOT NULL UNIQUE,
  customer_id     INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  -- 'preorder' | 'order'
  kind            TEXT NOT NULL DEFAULT 'preorder',
  -- 'reserved' → 'confirmed' → 'in_production' → 'shipped' → 'delivered' | 'cancelled'
  status          TEXT NOT NULL DEFAULT 'reserved',
  -- 'not_collected' while no payment provider is connected; 'pending' | 'paid' | 'refunded' later
  payment_status  TEXT NOT NULL DEFAULT 'not_collected',
  email           TEXT NOT NULL,
  name            TEXT NOT NULL,
  phone           TEXT,
  shipping_json   TEXT NOT NULL,
  items_json      TEXT NOT NULL,
  notes           TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_id, created_at);

CREATE TABLE IF NOT EXISTS password_resets (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id     INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL UNIQUE,
  expires_at      TEXT NOT NULL,
  used_at         TEXT,
  created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS waitlist (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT NOT NULL UNIQUE COLLATE NOCASE,
  product         TEXT,
  source          TEXT,
  created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enquiries (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  topic           TEXT NOT NULL,
  message         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'new',
  created_at      TEXT NOT NULL
);

-- every outgoing email attempt (bodies of security emails are never stored)
CREATE TABLE IF NOT EXISTS outbox (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  to_email        TEXT NOT NULL,
  subject         TEXT NOT NULL,
  kind            TEXT NOT NULL,
  status          TEXT NOT NULL,
  error           TEXT,
  created_at      TEXT NOT NULL
);
`;
