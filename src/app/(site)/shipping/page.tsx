import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Shipping & delivery",
  description: "Where OZARA delivers, what it costs, how long it takes and how you can track your order.",
  alternates: { canonical: "/shipping" },
};

// DEFAULTS chosen 2026-10-13 and not yet confirmed by the owner: India only, free delivery, 7–10 working
// days after dispatch, 48-hour damage report. Change the numbers below if the owner decides differently,
// and keep /returns and the FAQ in step.
const sections: LegalSection[] = [
  {
    id: "glance",
    title: "At a glance",
    body: [
      [
        "We deliver to addresses in India.",
        "Delivery is free.",
        "Once your order is dispatched, delivery usually takes 7 to 10 working days.",
        "We send you tracking details by email when it ships.",
      ],
    ],
  },
  {
    id: "where",
    title: "Where we deliver",
    body: ["For now we deliver only within India. If you would like an OZARA sent elsewhere, write to us and tell us where."],
  },
  {
    id: "cost",
    title: "What it costs",
    body: ["Delivery is free on every order to an address in India. The price you see at checkout is the price you pay."],
  },
  {
    id: "timing",
    title: "How long it takes",
    body: [
      "OZARA bracelets are made in a first run, in order of reservation. We show the expected dispatch time at checkout and confirm it by email. Once your order is dispatched, delivery usually takes 7 to 10 working days.",
      "These are estimates, not guarantees. Couriers can be delayed by weather, holidays and local conditions. If something changes, we will tell you.",
    ],
  },
  {
    id: "tracking",
    title: "Tracking your order",
    body: ["When your order ships, we email you the courier name and a tracking link. If you have not heard from us after the dispatch date we gave you, write to us."],
  },
  {
    id: "address",
    title: "Your address and delivery attempts",
    body: [
      "Please give a full address and a phone number the courier can reach, because jewellery is delivered to the person it is addressed to.",
      "If a delivery cannot be completed, the courier returns the parcel to us. We will contact you to arrange a new delivery, and we may ask you to cover the extra postage if the problem was a wrong address.",
    ],
  },
  {
    id: "arrival",
    title: "When your parcel arrives",
    body: [
      "Check the parcel before you accept it. If it looks opened or damaged, take photos and tell us within 48 hours of delivery. We will put it right as set out in our Returns & refunds page.",
    ],
  },
];

export default function ShippingPage() {
  return (
    <LegalPage
      eyebrow="Customer care"
      title="Shipping & delivery"
      intro={`Where we deliver, how long it takes and how to track your order. Questions? Write to ${site.contactEmail ?? "us"}.`}
      sections={sections}
    />
  );
}
