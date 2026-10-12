import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentCustomer } from "@/server/customers";
import { DetailsForm, PasswordForm, SignOut } from "@/components/account/AccountForms";
import { DeleteAccount } from "@/components/account/BraceletForms";
import { AccountNav } from "@/components/account/AccountNav";
import { EyeMark } from "@/components/brand/Emblem";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await currentCustomer();
  if (!me) redirect(`/account/login?next=${encodeURIComponent("/account/settings")}`);
  return (
    <div className="bg-paper">
      <section className="relative stage grain pt-[calc(var(--nav-h)+9vh)] pb-[7vh] overflow-hidden">
        <div className="shell relative">
          <p className="t-eyebrow flex items-center gap-3">
            <EyeMark className="w-6 text-[var(--c-strong)]" />
            Your account
          </p>
          <h1 className="t-display mt-4">Settings</h1>
          <AccountNav current="settings" />
        </div>
      </section>

      <section className="shell py-[clamp(3rem,8vh,5rem)] max-w-3xl space-y-16">
        <div>
          <h2 className="font-display text-[1.5rem] mb-6">Your details</h2>
          <DetailsForm customer={me} />
        </div>
        <div>
          <h2 className="font-display text-[1.5rem] mb-6">Password</h2>
          <PasswordForm />
        </div>
        <div>
          <h2 className="font-display text-[1.5rem] mb-3">Privacy</h2>
          <p className="text-[0.97rem] text-muted mb-6 max-w-[56ch]">
            Your account details are private. Only what you choose to put on a bracelet&rsquo;s card is shown, and you control that under{" "}
            <Link href="/account/card" className="underline underline-offset-4">
              Your card
            </Link>
            . See our{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="border-t border-line pt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <SignOut />
          <DeleteAccount />
        </div>
      </section>
    </div>
  );
}
