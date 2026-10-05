import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/server/customers";
import { ordersFor, ORDER_STATUS, PAYMENT_STATUS } from "@/server/orders";
import { formatDate, formatMonth } from "@/lib/format";
import { DetailsForm, PasswordForm, SignOut } from "@/components/account/AccountForms";
import { DeleteAccount } from "@/components/account/BraceletForms";
import { AccountNav } from "@/components/account/AccountNav";
import { braceletsForCustomer } from "@/server/bracelets";
import { sizeLabel } from "@/data/products";
import { EyeMark } from "@/components/brand/Emblem";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const me = await currentCustomer();
  if (!me) redirect("/account/login");
  const orders = ordersFor(me.id);
  const bracelets = braceletsForCustomer(me.id);
  const first = me.name.split(" ")[0];

  return (
    <div className="bg-paper">
      <section className="relative stage grain pt-[calc(var(--nav-h)+9vh)] pb-[7vh] overflow-hidden">
        <div className="shell relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow flex items-center gap-3">
              <EyeMark className="w-6 text-[var(--c-strong)]" />
              Your account
            </p>
            <h1 className="t-display mt-4">Welcome, {first}.</h1>
            <p className="t-body mt-3">
              Member since {formatMonth(me.created_at)} · {bracelets.length} bracelet{bracelets.length === 1 ? "" : "s"} registered
            </p>
            <AccountNav current="overview" />
          </div>
          <SignOut />
        </div>
      </section>

      <section className="shell py-[clamp(3rem,8vh,5rem)] grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-7">
          <h2 className="t-eyebrow !text-[var(--c-strong)]">Reservations &amp; orders</h2>
          {orders.length === 0 ? (
            <div className="mt-6 border-t border-line pt-8">
              <p className="t-subtitle">Nothing reserved yet.</p>
              <p className="t-body mt-2">When you reserve a piece, it appears here with its status.</p>
              <Link href="/shop" className="link-quiet mt-6">
                The collection
                <span className="rule" aria-hidden />
              </Link>
            </div>
          ) : (
            <ul className="mt-6 border-t border-line">
              {orders.map((o) => (
                <li key={o.reference} className="py-6 border-b border-line">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="font-display text-[1.25rem] tabular-nums tracking-[0.04em]">{o.reference}</p>
                    <p className="flex items-center gap-3">
                      {o.kind === "preorder" && <span className="badge-preorder">Pre-Order</span>}
                      <span className="t-eyebrow !text-[var(--c-deep)]">{ORDER_STATUS[o.status] ?? o.status}</span>
                    </p>
                  </div>
                  <ul className="mt-3 space-y-1 text-[1rem]">
                    {o.items.map((it, i) => (
                      <li key={i} className="text-[var(--c-strong)]">
                        {it.qty} × {it.name} <span className="text-muted">· {it.gemName} · {sizeLabel(it.size)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[0.875rem] text-faint">
                    Placed {formatDate(o.created_at)} · {PAYMENT_STATUS[o.payment_status] ?? o.payment_status} · To {o.shipping.city}, {o.shipping.country}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-4 lg:col-start-9 space-y-14">
          <div>
            <h2 className="t-eyebrow !text-[var(--c-strong)] mb-6">Your details</h2>
            <DetailsForm customer={me} />
          </div>
          <div>
            <h2 className="t-eyebrow !text-[var(--c-strong)] mb-6">Password</h2>
            <PasswordForm />
          </div>
          <div>
            <h2 className="t-eyebrow !text-[var(--c-strong)] mb-3">Privacy</h2>
            <p className="text-[0.92rem] text-muted mb-4">
              Your name, email and phone are never shown publicly. Choose what a bracelet&rsquo;s public page shows under{" "}
              <Link href="/account/bracelets" className="underline underline-offset-4">
                Bracelets
              </Link>
              . See our{" "}
              <Link href="/privacy" className="underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </p>
            <DeleteAccount />
          </div>
        </div>
      </section>
    </div>
  );
}
