import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AnimationGate } from "@/components/layout/AnimationGate";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PieceTransitionProvider } from "@/components/transition/PieceTransition";
import { CartProvider } from "@/components/commerce/Cart";
import { site } from "@/config/site";

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.brand,
  url: site.url,
  logo: `${site.url}/icon.svg`,
  sameAs: [site.instagram],
};

/** The marketing site: navigation, smooth scrolling, the piece transition, footer. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <CartProvider>
      <PieceTransitionProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:!fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-5 focus:py-3 bg-paper t-eyebrow !text-[var(--c-strong)] border border-[var(--c-line-strong)]">
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        <AnimationGate />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </PieceTransitionProvider>
      </CartProvider>
    </SmoothScroll>
  );
}
