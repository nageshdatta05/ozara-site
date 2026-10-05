import type { Metadata } from "next";
import { AuthShell } from "@/components/account/AuthShell";
import { ForgotForm } from "@/components/account/ResetForms";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell eyebrow="Your account" title="Forgotten your password?">
      <ForgotForm />
    </AuthShell>
  );
}
