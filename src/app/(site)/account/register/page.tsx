import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/server/customers";
import { AuthShell } from "@/components/account/AuthShell";
import { AuthForm } from "@/components/account/AuthForm";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (await currentCustomer()) redirect("/account");
  return (
    <AuthShell eyebrow="Your account" title="Create an account">
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </AuthShell>
  );
}
