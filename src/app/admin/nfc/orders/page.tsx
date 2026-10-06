import { requireAdmin } from "@/server/session";
import { allOrders, ORDER_FLOW, ORDER_STATUS, PAYMENT_STATUS } from "@/server/orders";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { formatWhen } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Reservations and orders placed through checkout. Read-only for now. */
export default async function OrdersPage() {
  await requireAdmin();
  const orders = allOrders();
  return (
    <div>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="t-eyebrow !text-[var(--c-ink-muted)]">Shop</p>
          <h1 className="t-title mt-2">Orders &amp; reservations</h1>
        </div>
        <p className="text-[0.92rem] text-[var(--c-ink-muted)] max-w-[46ch]">
          Reservations for pieces with stones: no money has been taken. Agree the price with each customer, then send a Shopify payment link (Shopify → Orders → Create order). Base Models are paid in Shopify and appear there.
        </p>
      </div>
      {orders.length === 0 ? (
        <p className="mt-10 text-[var(--c-ink-muted)]">No reservations yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border-t border-[var(--c-ink-line)]">
          <table className="w-full text-[0.95rem]">
            <thead>
              <tr className="text-left t-eyebrow !text-[var(--c-ink-muted)]">
                {["Reference", "Placed", "Customer", "Pieces", "Deliver to", "Status", "Payment"].map((h) => (
                  <th key={h} className="py-3 pr-6 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.reference} className="border-t border-[var(--c-ink-line)] align-top">
                  <td className="py-4 pr-6 tabular-nums whitespace-nowrap">{o.reference}{o.kind === "preorder" ? " · Pre-Order" : ""}</td>
                  <td className="py-4 pr-6 whitespace-nowrap">{formatWhen(o.created_at)}</td>
                  <td className="py-4 pr-6">
                    {o.name}
                    <br />
                    <a className="underline underline-offset-2" href={`mailto:${o.email}?subject=${encodeURIComponent(`Your OZARA reservation ${o.reference}`)}`}>{o.email}</a>
                    {o.phone && <><br />{o.phone}</>}
                    <br />
                    <span className="text-[var(--c-ink-muted)]">{o.customer_id ? "Account" : "Guest"}</span>
                  </td>
                  <td className="py-4 pr-6">
                    {o.items.map((it, i) => (
                      <div key={i}>
                        {it.qty} × {it.name} · {it.gemName}
                        {it.size ? ` · wrist ${it.size}` : ""}
                      </div>
                    ))}
                    {o.notes && <div className="mt-2 text-[var(--c-ink-muted)]">“{o.notes}”</div>}
                  </td>
                  <td className="py-4 pr-6">
                    {[o.shipping.line1, o.shipping.line2, o.shipping.city, o.shipping.region, o.shipping.postcode, o.shipping.country].filter(Boolean).join(", ")}
                  </td>
                  <td className="py-4 pr-6 whitespace-nowrap">
                    <StatusSelect url={`/api/admin/orders/${encodeURIComponent(o.reference)}`} value={o.status} options={ORDER_FLOW.map((k) => [k, ORDER_STATUS[k]])} />
                  </td>
                  <td className="py-4 pr-6 whitespace-nowrap">{PAYMENT_STATUS[o.payment_status] ?? o.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
