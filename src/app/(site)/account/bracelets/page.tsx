import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/server/customers";
import { braceletsForCustomer } from "@/server/bracelets";
import { products } from "@/data/products";
import { formatMonth } from "@/lib/format";
import { ClaimForm, OwnerControls } from "@/components/account/BraceletForms";
import { getOwnerProfile } from "@/server/profiles";
import { mayAct } from "@/server/verifyEmail";
import { AccountNav } from "@/components/account/AccountNav";
import { EyeMark } from "@/components/brand/Emblem";

export const metadata: Metadata = { title: "Your bracelets", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function BraceletsPage({ searchParams }: { searchParams: Promise<{ claim?: string }> }) {
  const me = await currentCustomer();
  const { claim = "" } = await searchParams;
  if (!me) redirect(`/account/login?next=${encodeURIComponent(`/account/bracelets${claim ? `?claim=${claim}` : ""}`)}`);
  if (!mayAct(me)) redirect(`/account/verify?next=${encodeURIComponent(`/account/bracelets${claim ? `?claim=${claim}` : ""}`)}`);
  const list = braceletsForCustomer(me.id);

  return (
    <div className="bg-paper">
      <section className="relative stage grain pt-[calc(var(--nav-h)+9vh)] pb-[6vh] overflow-hidden">
        <div className="shell relative">
          <p className="t-eyebrow flex items-center gap-3">
            <EyeMark className="w-6 text-[var(--c-strong)]" />
            Your account
          </p>
          <h1 className="t-display mt-4">Your bracelets</h1>
          <AccountNav current="bracelets" />
        </div>
      </section>

      <section className="shell py-[clamp(3rem,8vh,5rem)] grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-7">
          <h2 className="t-eyebrow !text-[var(--c-strong)]">Registered to you</h2>
          {list.length === 0 ? (
            <div className="mt-6 border-t border-line pt-8">
              <p className="t-subtitle">No bracelets registered yet.</p>
              <p className="t-body mt-2 max-w-[44ch]">When your piece arrives, register it with the claim code in its box.</p>
            </div>
          ) : (
            <ul className="mt-6 border-t border-line">
              {list.map((b) => {
                const p = products.find((x) => x.slug === b.product_slug);
                return (
                  <li key={b.bracelet_id} className="py-8 border-b border-line">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <p className="font-display text-[1.5rem] leading-tight">{p ? `${p.name.replace(/^The /, "")} bracelet` : "OZARA bracelet"}</p>
                      <p className="t-eyebrow" style={{ color: b.status === "active" ? "var(--c-deep)" : "var(--c-burgundy)" }}>
                        {b.status === "active" ? "Active" : b.status === "suspended" ? "Reported lost" : "Deactivated"}
                      </p>
                    </div>
                    <p className="text-[0.9rem] text-muted mt-1.5">
                      Registered {formatMonth(b.claimed_at)} · <span className="tabular-nums tracking-[0.04em]">{b.bracelet_id}</span>
                    </p>
                    {b.status !== "revoked" && (
                      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <Link href={`/account/bracelets/${b.bracelet_id}`} className="btn-solid">
                          {getOwnerProfile(b.id).published ? "Edit your card" : "Set up your card"}
                        </Link>
                        <Link href={`/b/${b.bracelet_id}`} className="btn-text">
                          See what people see
                        </Link>
                        <span className="text-[0.88rem] text-muted">{getOwnerProfile(b.id).published ? "Your card is live." : "Your card isn't set up yet."}</span>
                      </div>
                    )}
                    <details className="mt-6 group">
                      <summary className="btn-text cursor-pointer list-none">More options</summary>
                      <div className="mt-4">
                        <OwnerControls id={b.bracelet_id} status={b.status} visibility={b.owner_visibility} lostByOwner={b.revoked_reason === "Reported lost by owner"} />
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <h2 className="t-eyebrow !text-[var(--c-strong)] mb-3">Register a bracelet</h2>
          <p className="text-[0.95rem] text-muted mb-6">The ID and claim code are in the box — or use the transfer code you were given.</p>
          <ClaimForm initialId={claim.toUpperCase()} />
        </div>
      </section>
    </div>
  );
}
