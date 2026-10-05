import type { Metadata } from "next";
import { LegalPage, whoWeAre, type LegalSection } from "@/components/legal/LegalPage";
import { business, site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for OZARA reservations, pre-orders, customised jewellery, bracelet registration and events.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: [`These terms apply when you use this website, reserve or buy an ${site.brand} piece, register a bracelet or attend an ${site.brand} event. "We" means ${whoWeAre()}. They do not affect any rights you have under the law where you live.`],
  },
  {
    id: "preorders",
    title: "Reservations and pre-orders",
    body: [
      "Collection 01 is offered by pre-order. Placing a reservation on this website does not take payment and does not yet form a contract of sale. It asks us to hold a piece for you in the first production run.",
      "After you reserve, we contact you to confirm the price, your size, the stones you chose, delivery and timing. A contract is formed only when you accept that confirmation and pay. Until then either of us may cancel the reservation, at no cost to you.",
      "Delivery dates are estimates until confirmed in writing.",
    ],
  },
  {
    id: "custom",
    title: "Made-to-order and customised jewellery",
    body: [
      "Each piece is made to order, with the stones and size you confirm. Images on this website, including the stone previews, illustrate the design; natural stones and hand finishing mean every piece varies slightly in colour, inclusions and finish. The OZARA eye always remains on the piece; stones are set beside it, never over it.",
      "Pieces are offered in sizes S, M and L. We confirm the fit with you before production.",
    ],
  },
  {
    id: "prices",
    title: "Prices and payment",
    body: [
      "Prices are confirmed with you before payment. Where a price is shown on the website, it is the price at that time for the piece as configured. Payment is taken through our payment provider; we never see or store your full card details.",
    ],
  },
  {
    id: "cancellations",
    title: "Cancellations, returns and repairs",
    body: [
      "Before you pay, you can cancel a reservation at any time by contacting us.",
      "Because confirmed pieces are made to your specification, the conditions for cancelling a paid order, returns, repairs and warranty are set out in your order confirmation before you pay, together with any statutory rights you have.",
    ],
  },
  {
    id: "nfc",
    title: "Your bracelet's digital identity",
    body: [
      "Each bracelet carries an NFC tag linked to its record in our register. Its public page shows whether it is authentic, active and registered. Verification today relies on the identifier written to the tag and our register; it is not a cryptographic guarantee that a tag cannot be copied. We review unusual activity and may suspend a bracelet's record while we do.",
      "You register a bracelet to your account with the claim code supplied with it. Keep the code private. You can choose whether its public page shows your initials, report it lost, and transfer it to a new owner from your account.",
      "We may deactivate a bracelet's record if it is reported lost or stolen, if we believe it has been misused, or at the owner's request. Deactivation affects the digital record only, not your ownership of the jewellery.",
    ],
  },
  {
    id: "events",
    title: "Events and access",
    body: [
      "Some bracelets may give access to OZARA events. Eligibility is set per event and per bracelet and is not guaranteed for future events. Door staff verify bracelets with a tap or the bracelet ID; we may refuse entry if a bracelet cannot be verified, has been reported lost, or is not eligible, and may ask for identification.",
    ],
  },
  {
    id: "accounts",
    title: "Your account",
    body: [
      "Keep your password secure and tell us if you think your account has been misused. We may suspend accounts used to misuse the service. You can delete your account at any time from your account page.",
    ],
  },
  {
    id: "law",
    title: "Liability and law",
    body: [
      "We are responsible for loss or damage you suffer that is a foreseeable result of our breaking these terms or failing to use reasonable care, and nothing in these terms limits liability that cannot be limited by law.",
      business.governingLaw ? `These terms are governed by the law of ${business.governingLaw}.` : "These terms are governed by the law of the country from which we trade, without affecting your rights under the law where you live.",
    ],
  },
];

export default function TermsPage() {
  return <LegalPage eyebrow="Legal" title="Terms" intro="How reservations, made-to-order pieces, bracelet registration and events work." sections={sections} />;
}
