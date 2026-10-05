import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getOrder, PAYMENT_STATUS } from "@/server/orders";
import { currentCustomer } from "@/server/customers";
import { unsign } from "@/server/crypto";
import { preorder, site } from "@/config/site";
import { EyeMark } from "@/components/brand/Emblem";

export const metadata: Metadata = { title: "Reservation received", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Shown to the browser that placed the order, or to its signed-in owner. */
export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref = "" } = await searchParams;
  const order = getOrder(ref);
  const token = unsign<{ ref: string; exp: number }>((await cookies()).get("ozr_order")?.value);
  const me = await currentCustomer();
  const allowed = !!order && (token?.ref === order.reference || (me && order.customer_id === me.id));

  if (!order || !allowed)
    return (
      <section className="min-h-[80svh] flex flex-col items-center justify-center text-center px-6 pt-[var(--nav-h)]">
        <p className="t-title">We couldn&rsquo;t find that reservation.</p>
        <p className="t-body mt-3">If you placed it, sign in to see it in your account, or contact us and we&rsquo;ll help.</p>
        <Link href="/account" className="btn-line mt-8">
          Your account
        </Link>
      </section>
    );

  return (
    <section className="relative stage grain overflow-hidden min-h-[100svh] pt-[calc(var(--nav-h)+10vh)] pb-[10vh]">
      <div aria-hidden className="absolute -inset-[12%] light-beams anim-beams" />
      <div className="shell-narrow relative text-center flex flex-col items-center">
        <EyeMark className="w-12 text-[var(--c-strong)]" />
        <p className="mt-6">{order.kind === "preorder" && <span className="badge-preorder">{preorder.label} reserved</span>}</p>
        <h1 className="t-display mt-6">Thank you, {order.name.split(" ")[0]}.</h1>
        <p className="t-body mt-5 max-w-[44ch]">
          Your reservation <span className="text-[var(--c-strong)] tabular-nums tracking-[0.06em]">{order.reference}</span> has been received. We will write to{" "}
          <span className="text-[var(--c-strong)]">{order.email}</span> to confirm price, size and timing.
        </p>

        <div className="mt-10 w-full max-w-[34rem] text-left bg-[rgb(246_242_236/0.72)] backdrop-blur-md border border-line p-7">
          <ul className="divide-y divide-[var(--c-line)]">
            {order.items.map((it, i) => (
              <li key={i} className="py-3 flex justify-between gap-4 text-[1rem]">
                <span className="text-[var(--c-strong)]">
                  {it.qty} × {it.name}
                </span>
                <span className="text-muted">{it.gemName}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 pt-4 border-t border-line space-y-2 text-[0.95rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Payment</dt>
              <dd className="text-[var(--c-deep)]">{PAYMENT_STATUS[order.payment_status]}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Delivery to</dt>
              <dd className="text-[var(--c-strong)] text-right">
                {order.shipping.city}, {order.shipping.country}
              </dd>
            </div>
          </dl>
        </div>

        <ol className="mt-10 space-y-2 text-left">
          {preorder.steps.map((s, i) => (
            <li key={s} className="grid grid-cols-[1.8rem_1fr] text-[0.97rem] text-muted">
              <span className="tabular-nums text-[var(--c-burgundy)]">0{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap justify-center gap-8">
          {me ? (
            <Link href="/account" className="link-quiet">
              Your account
              <span className="rule" aria-hidden />
            </Link>
          ) : (
            <Link href="/account/register" className="link-quiet">
              Create an account
              <span className="rule" aria-hidden />
            </Link>
          )}
          <Link href="/shop" className="link-quiet">
            The collection
            <span className="rule" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
