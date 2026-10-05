import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bracelet verification",
  robots: { index: false, follow: false },
};

/** Bracelet pages open straight from an NFC tap — no site chrome, phone first. */
export default function BraceletLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100svh] bg-paper text-[var(--c-text)]">{children}</div>;
}
