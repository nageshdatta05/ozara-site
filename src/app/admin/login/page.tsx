import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/server/session";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin/nfc");
  return (
    <div className="max-w-sm mx-auto py-10">
      <p className="t-eyebrow">Admin</p>
      <h1 className="t-title mt-3">Sign in</h1>
      <p className="t-body mt-4">Manage bracelets, events and authentication history.</p>
      {adminConfigured() ? (
        <LoginForm />
      ) : (
        <p className="mt-8 text-[0.97rem]">Admin access is not configured. Set <code>OZARA_ADMIN_PASSWORD</code> in the environment.</p>
      )}
    </div>
  );
}
