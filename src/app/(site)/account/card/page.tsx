import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/server/customers";
import { braceletsForCustomer } from "@/server/bracelets";
import { getOwnerProfile } from "@/server/profiles";
import { mayAct } from "@/server/verifyEmail";
import { products } from "@/data/products";
import { AccountNav } from "@/components/account/AccountNav";
import { EyeMark } from "@/components/brand/Emblem";

export const metadata: Metadata = { title: "Your card", robots: { index: false } };
export const dynamic = "force-dynamic";

/** One tap from the account menu to the card: straight to the editor if there is one bracelet. */
export default async function CardIndex() {
  const me = await currentCustomer();
  if (!me) redirect(`/account/login?next=${encodeURIComponent("/account/card")}`);
  if (!mayAct(me)) redirect(`/account/verify?next=${encodeURIComponent("/account/card")}`);
  const list = braceletsForCustomer(me.id).filter((b) => b.status !== "revoked");
  if (list.length === 0) redirect("/account/bracelets");
  if (list.length === 1) redirect(`/account/bracelets/${list[0].bracelet_id}`);
  return (
    <div className="bg-paper">
      <section className="relative stage grain pt-[calc(var(--nav-h)+9vh)] pb-[6vh] overflow-hidden">
        <div className="shell relative">
          <p className="t-eyebrow flex items-center gap-3">
            <EyeMark className="w-6 text-[var(--c-strong)]" />
            Your account
          </p>
          <h1 className="t-display mt-4">Choose a card</h1>
          <AccountNav current="card" />
        </div>
      </section>
      <section className="shell py-[clamp(3rem,8vh,5rem)] max-w-3xl">
        <ul className="border-t border-line">
          {list.map((b) => {
            const p = products.find((x) => x.slug === b.product_slug);
            const live = getOwnerProfile(b.id).published;
            return (
              <li key={b.bracelet_id} className="border-b border-line">
                <Link href={`/account/bracelets/${b.bracelet_id}`} className="flex items-center justify-between gap-6 py-6 hover:opacity-70 transition-opacity">
                  <span>
                    <span className="font-display text-[1.4rem] block">{p?.name ?? "OZARA"} bracelet</span>
                    <span className="text-[0.9rem] text-muted">{live ? "Card is live" : "Card not set up yet"}</span>
                  </span>
                  <span className="t-eyebrow">Edit card →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
