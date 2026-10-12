import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { currentCustomer } from "@/server/customers";
import { findBracelet } from "@/server/bracelets";
import { getOwnerProfile } from "@/server/profiles";
import { mayAct } from "@/server/verifyEmail";
import { products } from "@/data/products";
import { CardEditor } from "@/components/account/CardEditor";

export const metadata: Metadata = { title: "Your card", robots: { index: false } };
export const dynamic = "force-dynamic";

/** The card editor for one bracelet. */
export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await currentCustomer();
  if (!me) redirect(`/account/login?next=${encodeURIComponent(`/account/bracelets/${id}`)}`);
  if (!mayAct(me)) redirect(`/account/verify?next=${encodeURIComponent(`/account/bracelets/${id}`)}`);
  const b = findBracelet(id);
  if (!b || b.owner_customer_id !== me.id) notFound();
  if (b.status === "revoked") redirect("/account/bracelets");
  const product = products.find((p) => p.slug === b.product_slug);
  return <CardEditor id={b.bracelet_id} profile={getOwnerProfile(b.id)} productName={product ? `${product.name.replace(/^The /, "")} bracelet` : "bracelet"} />;
}
