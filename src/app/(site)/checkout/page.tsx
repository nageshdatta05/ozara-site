import type { Metadata } from "next";
import { Checkout } from "@/components/checkout/Checkout";
import { EyeMark } from "@/components/brand/Emblem";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="bg-paper min-h-[100svh]">
      <header className="shell pt-[calc(var(--nav-h)+7vh)] pb-10">
        <p className="t-eyebrow flex items-center gap-3">
          <EyeMark className="w-6 text-[var(--c-strong)]" />
          Checkout
        </p>
        <h1 className="t-display mt-4">Reserve your piece.</h1>
      </header>
      <Checkout />
    </div>
  );
}
