import { cookies } from "next/headers";
import { body, fail, json, sameOrigin } from "@/server/http";
import { currentCustomer } from "@/server/customers";
import { createOrder } from "@/server/orders";
import { paymentsConnected } from "@/server/payments";
import { sign } from "@/server/crypto";
import { inbox, sendEmail } from "@/server/email";
import { publicBase } from "@/server/urls";
import { site } from "@/config/site";
import { sizeLabel } from "@/data/products";

/**
 * Place an order. With no payment provider connected this saves a
 * pre-order RESERVATION — nothing is charged, and the response says so.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  if (paymentsConnected()) return json({ error: "Payment checkout is configured but not implemented. See src/server/payments.ts." }, 501);
  try {
    const b = await body<Record<string, unknown>>(req);
    const customer = await currentCustomer();
    const order = createOrder({
      items: b.items,
      email: b.email,
      name: b.name,
      phone: b.phone,
      shipping: b.shipping,
      notes: b.notes,
      customerId: customer?.id ?? null,
    });
    // lets this browser open its confirmation page (guests have no account)
    (await cookies()).set("ozr_order", sign({ ref: order.reference, exp: Date.now() + 7 * 864e5 }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 86400,
    });
    const lines = order.items.map((i) => `  ${i.qty} × ${i.name} — ${i.gemName} — ${sizeLabel(i.size)}`).join("\n");
    await sendEmail({
      to: order.email,
      kind: "order_confirmation",
      subject: `Your ${site.brand} reservation ${order.reference}`,
      text: `Dear ${order.name},\n\nThank you — your reservation ${order.reference} has been received.\n\n${lines}\n\nNo payment has been taken. We will write to confirm price, size and timing before your piece is made.\n\n${customer ? `You can follow it in your account: ${publicBase()}/account` : ""}\n\n— ${site.brand}`,
    });
    const to = inbox();
    if (to)
      await sendEmail({
        to,
        kind: "order_notification",
        subject: `New reservation ${order.reference} — ${order.name}`,
        text: `${order.name} <${order.email}>${order.phone ? ` · ${order.phone}` : ""}\n\n${lines}\n\nDeliver to: ${[order.shipping.line1, order.shipping.line2, order.shipping.city, order.shipping.region, order.shipping.postcode, order.shipping.country].filter(Boolean).join(", ")}\n${order.notes ? `\nNote: ${order.notes}` : ""}\n\nAdmin: ${publicBase()}/admin/nfc/orders`,
      });
    return json({ reference: order.reference, payment: "not_collected" });
  } catch (e) {
    return fail(e);
  }
}
