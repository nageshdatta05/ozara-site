import type { Metadata, Viewport } from "next";
import { Belleza, Libre_Caslon_Display, Libre_Caslon_Text, Manrope } from "next/font/google";
import { site } from "@/config/site";
import { existsSync } from "node:fs";
import path from "node:path";
import "./globals.css";

// Brown Sugar — the brand face. Drop the licensed file at
// public/fonts/brown-sugar.woff2 and it is used for every display heading.
const BRAND_FONT = existsSync(path.join(process.cwd(), "public", "fonts", "brown-sugar.woff2"))
  ? `@font-face{font-family:"Brown Sugar";src:url("/fonts/brown-sugar.woff2") format("woff2");font-display:swap}`
  : null;

// Display: an engraved, high-contrast Caslon — editorial, warm, unhurried.
const display = Libre_Caslon_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-src",
  display: "swap",
});

// Italic accents: the text cut of the same family.
const italic = Libre_Caslon_Text({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-italic-src",
  display: "swap",
});

// Text/UI: a calm, precise grotesque.
const sans = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans-src",
  display: "swap",
});

// Wordmark and piece names: a flared humanist capital, matching the OZARA logotype.
const mark = Belleza({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mark-src",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.brand} — ${site.tagline}`, template: `%s — ${site.brand}` },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.brand,
    title: `${site.brand} — ${site.tagline}`,
    description: site.description,
    images: [{ url: "/media/collection/flow/campaign.jpg", width: 2400, height: 1332, alt: "The Flow, an OZARA bracelet in silver, on marble" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#f6f2ec",
  colorScheme: "light",
};

/** Root shell only — each area (site, bracelet pages, verify, admin) has its own layout. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${italic.variable} ${sans.variable} ${mark.variable}`}>
      {BRAND_FONT && (
        <head>
          <link rel="preload" href="/fonts/brown-sugar.woff2" as="font" type="font/woff2" crossOrigin="" />
          <style dangerouslySetInnerHTML={{ __html: BRAND_FONT }} />
        </head>
      )}
      <body>{children}</body>
    </html>
  );
}
