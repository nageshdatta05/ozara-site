import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Returns & refunds",
  description: "How to cancel an OZARA order, return a Base Model, get a refund, and what the warranty covers.",
  alternates: { canonical: "/returns" },
};

// DEFAULTS chosen 2026-10-13 and not yet confirmed by the owner: 7-day return for unworn Base Models,
// 7–10 working-day refunds, 48-hour damage report, 6-month defect warranty, stone pieces made to order.
// Change the numbers below if the owner decides differently, and keep /shipping and the FAQ in step.
const sections: LegalSection[] = [
  {
    id: "glance",
    title: "At a glance",
    body: [
      [
        "Base Models can be returned within 7 days of delivery if they are unworn, undamaged and in their original packaging.",
        "Pieces with stones are made for you, so they cannot be returned if you simply change your mind. Faults are always covered.",
        "Refunds go back to the way you paid, within 7 to 10 working days of us receiving and checking the piece.",
        "Every OZARA has a 6-month warranty against manufacturing defects.",
      ],
    ],
  },
  {
    id: "cancel",
    title: "Cancelling an order",
    body: [
      "Base Model: you can cancel any time before we dispatch it and we will refund you in full. Write to us with your order number.",
      "Piece with stones: you can cancel at any time before you pay. Once you have paid and we have confirmed your stones and size, the piece is made for you and cannot be cancelled.",
    ],
  },
  {
    id: "returns",
    title: "Returning a Base Model",
    body: [
      "Changed your mind? You have 7 days from the day it is delivered. To be accepted, the bracelet must be unworn, undamaged, with its pouch and packaging, and not altered in any way.",
      [
        "Write to us with your order number and tell us you would like to return it.",
        "We will confirm and send you the return address.",
        "Send it back with tracking. For a change-of-mind return, the return postage is paid by you.",
        "We check the piece when it arrives and tell you the result.",
      ],
      "Please keep your tracking proof until your refund is confirmed.",
    ],
  },
  {
    id: "refunds",
    title: "Refunds",
    body: [
      "We refund to the same payment method you used. It takes us 7 to 10 working days after we receive and approve the return, and your bank or card provider may need a few more days to show it.",
      "If we cannot accept a return because the piece has been worn, damaged or altered, we will tell you why and send it back to you.",
    ],
  },
  {
    id: "faults",
    title: "Damaged, faulty or wrong item",
    body: [
      "If your bracelet arrives damaged, does not work as it should or is not what you ordered, tell us within 48 hours of delivery. Send photos (and a short video of the parcel being opened, if you have one).",
      "We will replace it or refund you in full, and we cover the postage both ways.",
    ],
  },
  {
    id: "warranty",
    title: "Warranty",
    body: [
      "Every OZARA bracelet has a 6-month warranty from the day of delivery against manufacturing defects. This includes the NFC tag not working under normal use.",
      "It does not cover everyday wear and scratches, loss or theft, damage from knocks, water, perfume or chemicals, or repairs made by anyone other than us.",
      "To make a claim, write to us with your order number and photos. If it is covered, we will repair or replace it.",
    ],
  },
  {
    id: "digital",
    title: "Your bracelet's digital record",
    body: [
      "If you registered the bracelet to your account, we will deactivate that registration when we accept a return, so the bracelet and its tap page no longer open for you.",
    ],
  },
];

export default function ReturnsPage() {
  return (
    <LegalPage
      eyebrow="Customer care"
      title="Returns & refunds"
      intro={`How to cancel an order, return a bracelet and get your money back. Questions? Write to ${site.contactEmail ?? "us"}.`}
      sections={sections}
    />
  );
}
