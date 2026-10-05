import type { Metadata, Viewport } from "next";

export const metadata: Metadata = { title: "Event verification", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#15120f" };

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return <div className="theme-dark min-h-[100svh] bg-midnight text-[var(--c-text)]">{children}</div>;
}
