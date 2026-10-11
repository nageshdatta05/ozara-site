import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/server/customers";
import { db } from "@/server/db";
import { AuthShell } from "@/components/account/AuthShell";
import { VerifyForm } from "@/components/account/VerifyForm";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/account" } = await searchParams;
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const me = await currentCustomer();
  if (!me) redirect(`/account/login?next=${encodeURIComponent("/account/verify")}`);
  if (me.email_verified) redirect(safeNext);
  // a code was just sent (by sign-up); otherwise the page sends one on arrival
  const pending = db().prepare("SELECT 1 FROM email_codes WHERE customer_id = ? AND used_at IS NULL AND expires_at > ?").get(me.id, new Date().toISOString());
  return (
    <AuthShell eyebrow="One last step" title="Verify your email">
      <VerifyForm email={me.email} next={safeNext} sendFirst={!pending} />
    </AuthShell>
  );
}
