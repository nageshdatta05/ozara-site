import "server-only";
import { payments } from "@/config/site";

/* ==========================================================================
   PAYMENTS — not connected.
   While `payments.provider` is null, checkout saves a reservation and takes
   no money. To take payment (e.g. Stripe):
     1. npm install stripe; set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.
     2. Implement createPaymentSession(): create a Checkout Session for the
        order's items (prices must exist in products.ts), with the order
        reference as client_reference_id, and return its URL.
     3. Add /api/payments/webhook: on checkout.session.completed, set the
        order's payment_status to 'paid'. Never mark an order paid from the
        browser.
     4. Set payments.provider = "stripe" in src/config/site.ts.
   ========================================================================== */

export const paymentsConnected = () => payments.provider !== null;

export async function createPaymentSession(_order: { reference: string }): Promise<{ url: string }> {
  void _order;
  throw new Error("No payment provider is connected. See src/server/payments.ts.");
}
