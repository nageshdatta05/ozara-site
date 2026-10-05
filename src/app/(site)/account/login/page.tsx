import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/server/customers";
import { AuthShell } from "@/components/account/AuthShell";
import { AuthForm } from "@/components/account/AuthForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentCustomer()) redirect("/account");
  return (
    <AuthShell eyebrow="Your account" title="Sign in">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
