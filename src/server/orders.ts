import "server-only";
import { randomBytes } from "node:crypto";
import { db, nowIso } from "./db";
import { InputError } from "./bracelets";
import { GEMS, gemName, getProduct, unitPrice, validSize, type GemKey } from "@/data/products";

/* ==========================================================================
   ORDERS — pre-order reservations today; paid orders once a payment
   provider is connected (see payments.ts). The server re-reads every item
   from the catalogue: nothing the browser sends about a product is trusted.
   ========================================================================== */

export type OrderItem = { slug: string; name: string; gem: GemKey | null; gemName: string; size: string | null; qty: number; unitPrice: number | null; currency: string | null };
export type Shipping = { line1: string; line2: string; city: string; region: string; postcode: string; country: string };
export type Order = {
  id: number;
  reference: string;
  customer_id: number | null;
  kind: string;
  status: string;
  payment_status: string;
  email: string;
  name: string;
  phone: string | null;
  shipping: Shipping;
  items: OrderItem[];
  notes: string | null;
  created_at: string;
};

const s = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function reference() {
  // OZ-7K3QP9 — short, unambiguous characters
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = randomBytes(6);
  return "OZ-" + Array.from(b, (x) => abc[x % abc.length]).join("");
}

export function createOrder(input: {
  items: unknown;
  email: unknown;
  name: unknown;
  phone?: unknown;
  shipping: unknown;
  notes?: unknown;
  customerId: number | null;
}): Order {
  const raw = Array.isArray(input.items) ? input.items.slice(0, 20) : [];
  const items: OrderItem[] = [];
  for (const it of raw as { slug?: unknown; gem?: unknown; size?: unknown; qty?: unknown }[]) {
    const p = getProduct(s(it.slug, 80));
    if (!p) throw new InputError("One of the pieces in your bag is no longer available.");
    if (p.availability !== "preorder" && p.availability !== "available") throw new InputError(`${p.name} cannot be reserved right now.`);
    const gemKey = GEMS.find((g) => g.key === it.gem)?.key ?? null;
    const qty = Math.min(Math.max(Math.floor(Number(it.qty) || 1), 1), 5);
    if (!validSize(it.size)) throw new InputError(`Please choose a size (S, M or L) for ${p.name}.`);
    const price = unitPrice(p, gemKey);
    items.push({
      slug: p.slug,
      name: p.name,
      gem: gemKey,
      gemName: gemName(gemKey),
      size: it.size,
      qty,
      unitPrice: price?.amount ?? null,
      currency: price?.currency ?? null,
    });
  }
  if (!items.length) throw new InputError("Your bag is empty.");

  const email = s(input.email).toLowerCase();
  const name = s(input.name, 120);
  const phone = s(input.phone, 40) || null;
  if (!EMAIL.test(email)) throw new InputError("Please enter a valid email address.");
  if (!name) throw new InputError("Please enter your name.");
  const sh = (input.shipping ?? {}) as Record<string, unknown>;
  const shipping: Shipping = {
    line1: s(sh.line1),
    line2: s(sh.line2),
    city: s(sh.city, 100),
    region: s(sh.region, 100),
    postcode: s(sh.postcode, 20),
    country: s(sh.country, 80),
  };
  if (!shipping.line1 || !shipping.city || !shipping.country) throw new InputError("Please complete your delivery address.");

  const allPreorder = items.every((i) => getProduct(i.slug)?.availability === "preorder");
  const now = nowIso();
  const ref = reference();
  db()
    .prepare(
      `INSERT INTO orders (reference, customer_id, kind, status, payment_status, email, name, phone, shipping_json, items_json, notes, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .run(ref, input.customerId, allPreorder ? "preorder" : "order", "reserved", "not_collected", email, name, phone, JSON.stringify(shipping), JSON.stringify(items), s(input.notes, 1000) || null, now, now);
  return getOrder(ref)!;
}

type Row = Omit<Order, "shipping" | "items"> & { shipping_json: string; items_json: string };
const hydrate = (r: Row): Order => {
  const { shipping_json, items_json, ...rest } = r;
  return { ...rest, shipping: JSON.parse(shipping_json), items: JSON.parse(items_json) };
};

export function getOrder(ref: string): Order | undefined {
  const r = db().prepare("SELECT * FROM orders WHERE reference = ?").get(ref) as Row | undefined;
  return r ? hydrate(r) : undefined;
}

export function ordersFor(customerId: number): Order[] {
  return (db().prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC").all(customerId) as Row[]).map(hydrate);
}

export function allOrders(limit = 200): Order[] {
  return (db().prepare("SELECT * FROM orders ORDER BY id DESC LIMIT ?").all(limit) as Row[]).map(hydrate);
}

export const ORDER_STATUS: Record<string, string> = {
  reserved: "Reserved",
  confirmed: "Confirmed",
  in_production: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
export const PAYMENT_STATUS: Record<string, string> = {
  not_collected: "No payment taken",
  pending: "Payment pending",
  paid: "Paid",
  refunded: "Refunded",
};

export const ORDER_FLOW = ["reserved", "confirmed", "in_production", "shipped", "delivered", "cancelled"] as const;

/** Admin: move an order along. Payment status changes only through the payment provider. */
export function setOrderStatus(reference: string, status: string) {
  if (!ORDER_FLOW.includes(status as (typeof ORDER_FLOW)[number])) throw new InputError("Unknown status.");
  const r = db().prepare("UPDATE orders SET status=?, updated_at=? WHERE reference=?").run(status, nowIso(), reference);
  if (!r.changes) throw new InputError("Order not found.");
  return getOrder(reference)!;
}
