import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/server/customers";
import { braceletsForCustomer } from "@/server/bracelets";
import { products } from "@/data/products";
import { formatMonth } from "@/lib/format";
import { ClaimForm, OwnerControls } from "@/components/account/BraceletForms";
import { ProfileEditor } from "@/components/account/ProfileEditor";
import { getOwnerProfile } from "@/server/profiles";
import { AccountNav } from "@/components/account/AccountNav";
import { EyeMark } from "@/components/brand/Emblem";

export const metadata: Metadata = { title: "Your bracelets", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function BraceletsPage({ searchParams }: { searchParams: Promise<{ claim?: string }> }) {
  const me = await currentCustomer();
  const { claim = "" } = await searchParams;
  if (!me) redirect(`/account/login?next=${encodeURIComponent(`/account/bracelets${claim ? `?claim=${claim}` : ""}`)}`);
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
                  <li key={b.bracelet_id} className="py-7 border-b border-line">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <p className="font-display text-[1.35rem] tabular-nums tracking-[0.04em]">{b.bracelet_id}</p>
                      <p className="t-eyebrow" style={{ color: b.status === "active" ? "var(--c-deep)" : "var(--c-burgundy)" }}>
                        {b.status === "active" ? "Active" : b.status === "suspended" ? "Reported lost" : "Deactivated"}
                      </p>
                    </div>
                    <p className="text-[1rem] text-muted mt-1">
                      {p?.name ?? "OZARA bracelet"} · registered {formatMonth(b.claimed_at)}
                    </p>
                    <Link href={`/b/${b.bracelet_id}`} className="link-quiet mt-4">
                      Its public page
                      <span className="rule" aria-hidden />
                    </Link>
                    <div className="mt-5">
                      <ProfileEditor id={b.bracelet_id} profile={getOwnerProfile(b.id)} disabled={b.status === "revoked"} />
                    </div>
                    <div className="mt-5">
                      <OwnerControls id={b.bracelet_id} status={b.status} visibility={b.owner_visibility} lostByOwner={b.revoked_reason === "Reported lost by owner"} />
                    </div>
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
