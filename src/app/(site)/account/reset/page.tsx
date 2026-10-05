import type { Metadata } from "next";
import Link from "next/link";
import { resetTokenValid } from "@/server/customers";
import { AuthShell } from "@/components/account/AuthShell";
import { ResetForm } from "@/components/account/ResetForms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const ok = resetTokenValid(token);
  return (
    <AuthShell eyebrow="Your account" title={ok ? "Choose a new password" : "This link has expired"}>
      {ok ? (
        <ResetForm token={token} />
      ) : (
        <div className="space-y-4">
          <p className="text-[1.02rem] text-[var(--c-strong)]">Reset links work once, for one hour. Request a new one and use the latest email.</p>
          <Link href="/account/forgot" className="btn-solid w-full">
            Send a new link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
