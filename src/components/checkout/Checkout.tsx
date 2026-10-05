"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LineRow, Totals, useCart } from "@/components/commerce/Cart";
import { Field } from "@/components/account/AuthForm";
import { gemName, getProduct, isPreorder, sizeLabel } from "@/data/products";
import { payments, preorder } from "@/config/site";

type Me = { name: string; email: string; phone: string | null } | null;

/**
 * Checkout — one calm page: contact, delivery, review, payment.
 * With no payment provider connected, placing the order saves a
 * RESERVATION and says so; it never pretends money was taken.
 */
export function Checkout() {
  const router = useRouter();
  const { lines, ready, clear } = useCart();
  const [me, setMe] = useState<Me>(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", line1: "", line2: "", city: "", region: "", postcode: "", country: "", notes: "" });
  const [agree, setAgree] = useState(false);
  const [makeAccount, setMakeAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.customer) {
          setMe(d.customer);
          setF((x) => ({ ...x, name: x.name || d.customer.name, email: x.email || d.customer.email, phone: x.phone || d.customer.phone || "" }));
        }
      })
      .catch(() => {});
  }, []);

  const anyPreorder = lines.some((l) => {
    const p = getProduct(l.slug);
    return p && isPreorder(p);
  });
  const reservation = payments.provider === null;

  const place = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const missing = [
      !f.name.trim() && "your name",
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()) && "a valid email",
      !f.line1.trim() && "your address",
      !f.city.trim() && "your city",
      !f.country.trim() && "your country",
    ].filter(Boolean);
    if (missing.length) return setErr(`Please add ${missing.join(", ")}.`);
    if (makeAccount && password.length < 8) return setErr("Choose a password of at least 8 characters for your account.");
    if (!agree) return setErr("Please confirm you have read how your reservation works.");
    setBusy(true);
    try {
      if (!me && makeAccount) {
        const a = await fetch("/api/account/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: f.name, email: f.email, password, phone: f.phone }),
        });
        const ad = await a.json().catch(() => ({}));
        if (!a.ok) throw new Error(ad.error || "We couldn't create your account.");
      }
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ slug: l.slug, gem: l.gem, size: l.size, qty: l.qty })),
          name: f.name,
          email: f.email,
          phone: f.phone,
          notes: f.notes,
          shipping: { line1: f.line1, line2: f.line2, city: f.city, region: f.region, postcode: f.postcode, country: f.country },
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Something went wrong.");
      clear();
      router.push(`/checkout/confirmation?ref=${encodeURIComponent(d.reference)}`);
    } catch (e) {
      const m = (e as Error).message;
      setErr(/fetch|network/i.test(m) ? "We couldn't reach the server. Check your connection and try again — nothing has been reserved yet." : m);
      setBusy(false);
    }
  };

  if (!ready) return <div className="min-h-[60vh]" />;
  if (lines.length === 0)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <p className="t-title">Your bag is empty.</p>
        <p className="t-body mt-3">Choose a piece and its stones to reserve it.</p>
        <Link href="/shop" className="btn-line mt-8">
          The collection
        </Link>
      </div>
    );

  return (
    <form onSubmit={place} className="shell grid lg:grid-cols-12 gap-12 lg:gap-16 pb-[var(--space-section)]" noValidate>
      <div className="lg:col-span-7 space-y-14">
        <Step n={1} title="Contact">
          {!me && (
            <p className="text-[0.95rem] text-muted mb-6">
              Have an account?{" "}
              <Link href="/account/login?next=/checkout" className="text-[var(--c-strong)] underline underline-offset-4">
                Sign in
              </Link>{" "}
              to see this reservation in your account.
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full name" autoComplete="name" value={f.name} onChange={set("name")} required />
            <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={set("email")} required />
            <Field label="Phone (optional)" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} />
          </div>
          {!me && (
            <div className="mt-6 border-t border-line pt-5">
              <label className="flex items-start gap-3 text-[0.97rem] text-[var(--c-strong)] cursor-pointer">
                <input type="checkbox" checked={makeAccount} onChange={(e) => setMakeAccount(e.target.checked)} className="mt-1 accent-[var(--c-deep)] size-4" />
                Create an account to follow this reservation and register your bracelet when it arrives
              </label>
              {makeAccount && (
                <div className="mt-4 max-w-sm">
                  <Field label="Choose a password" type="password" autoComplete="new-password" hint="At least 8 characters." value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              )}
            </div>
          )}
        </Step>

        <Step n={2} title="Delivery">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field className="" label="Address" autoComplete="address-line1" value={f.line1} onChange={set("line1")} required />
            <Field label="Apartment, suite (optional)" autoComplete="address-line2" value={f.line2} onChange={set("line2")} />
            <Field label="City" autoComplete="address-level2" value={f.city} onChange={set("city")} required />
            <Field label="County / State" autoComplete="address-level1" value={f.region} onChange={set("region")} />
            <Field label="Postcode" autoComplete="postal-code" value={f.postcode} onChange={set("postcode")} />
            <Field label="Country" autoComplete="country-name" value={f.country} onChange={set("country")} required />
          </div>
          <p className="mt-4 text-[0.875rem] text-faint">Delivery is arranged once your piece is made. The method, cost and timing are confirmed with you before you pay.</p>
        </Step>

        <Step n={3} title="Your pieces">
          <ul className="divide-y divide-[var(--c-line)] border-y border-line">
            {lines.map((l) => (
              <LineRow key={l.id} line={l} compact />
            ))}
          </ul>
          <label className="block mt-6">
            <span className="t-eyebrow block mb-2">A note for us (optional)</span>
            <textarea className="field min-h-[5.5rem]" value={f.notes} onChange={set("notes")} placeholder="Wrist size if you know it, an occasion, a question…" />
          </label>
        </Step>

        <Step n={4} title="Payment">
          {reservation ? (
            <div className="border border-[rgb(0_7_43/0.2)] bg-[var(--c-deep-tint)] p-6">
              <p className="t-eyebrow !text-[var(--c-deep)]">No payment is taken today</p>
              <p className="t-body mt-3 !text-[var(--c-strong)]">
                Placing this {anyPreorder ? "pre-order" : "order"} reserves your piece. We will contact you to confirm price, size and delivery, and send a secure payment
                request before production begins.
              </p>
              <label className="mt-5 flex items-start gap-3 text-[0.95rem] text-[var(--c-strong)] cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[var(--c-deep)] size-4" />
                I understand this is a reservation, and that nothing is charged until I confirm the details with OZARA.
              </label>
            </div>
          ) : (
            <p className="t-body">Secure payment is handled by our payment provider on the next step.</p>
          )}
        </Step>
      </div>

      {/* Summary */}
      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] bg-linen p-7 md:p-9">
          <p className="t-eyebrow !text-[var(--c-strong)]">Summary</p>
          <ul className="mt-4 divide-y divide-[var(--c-line)] border-y border-line">
            {lines.map((l) => {
              const p = getProduct(l.slug)!;
              return (
                <li key={l.id} className="py-3 flex justify-between gap-4 text-[0.97rem]">
                  <span className="text-[var(--c-strong)]">
                    {l.qty} × {p.name}
                  </span>
                  <span className="text-muted text-right">
                    {gemName(l.gem)}
                    <span className="block text-[0.82rem] text-faint">{sizeLabel(l.size)}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5">
            <Totals lines={lines} />
          </div>
          {anyPreorder && (
            <div className="mt-6 pt-5 border-t border-line">
              <span className="badge-preorder">{preorder.label}</span>
              <ol className="mt-4 space-y-2">
                {preorder.steps.map((s, i) => (
                  <li key={s} className="grid grid-cols-[1.6rem_1fr] text-[0.84rem] text-muted">
                    <span className="tabular-nums text-[var(--c-burgundy)]">0{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {err && (
            <p role="alert" className="mt-6 text-[0.95rem] text-[var(--c-burgundy)]">
              {err}
            </p>
          )}
          <button type="submit" className="btn-solid w-full mt-7 !min-h-[3.6rem]" disabled={busy}>
            {busy ? "Placing…" : reservation ? (anyPreorder ? "Place pre-order reservation" : "Place reservation") : "Continue to payment"}
          </button>
          <p className="mt-4 text-[0.82rem] text-faint text-center">Your details are used only for this order.</p>
        </div>
      </aside>
    </form>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex items-baseline gap-4 border-b border-line pb-4 mb-7">
        <span className="t-eyebrow tabular-nums !text-[var(--c-deep)]">0{n}</span>
        <span className="t-subtitle">{title}</span>
      </h2>
      {children}
    </section>
  );
}
