/* ==========================================================================
   FAQ — grouped questions for /faq (and a few on each product page).
   Answers only say what is true of the service today; where something is not
   yet decided (prices, metals, delivery times) they say how it is confirmed.
   ========================================================================== */

import { site, preorder } from "@/config/site";

export type Faq = { title: string; body: string };

export const faqGroups: { key: string; title: string; items: Faq[] }[] = [
  {
    key: "house",
    title: "The house",
    items: [
      {
        title: "What is OZARA?",
        body: `A luxury bracelet — and the community it lets you into. Each ${site.brand} comes with your own ${site.brand} ID and opens access and perks at ${site.brand} events. Collection 01 is three designs: the Wave, the Flow and the Line.`,
      },
      {
        title: "What makes OZARA different?",
        body: "It is jewellery first — and your way in. Each piece is registered to its owner; a tap of the Eye shows it is genuine, and at OZARA events it opens the door.",
      },
      {
        title: "What are OZARA Exclusive and OZARA Approved events?",
        body: "OZARA Exclusive events are made only for OZARA holders — your bracelet is the invitation. OZARA Approved events are selected events beyond our own, where holders are recognised and receive more. Which events a bracelet opens is set for each event.",
      },
      {
        title: "Can I use my bracelet more than once?",
        body: "Yes. Unlike a festival wristband, it is yours to keep — the same bracelet works at every eligible OZARA event after.",
      },
      {
        title: "What does the Eye represent?",
        body: "Our emblem — a ring and a four-pointed star — set into the metal. It is how OZARA holders recognise each other, and it is where your OZARA identity lives: hold the Eye to a phone and your OZARA ID opens.",
      },
      {
        title: "What does the Wave represent?",
        body: "Movement and individuality. Each design follows the wrist rather than sitting on it.",
      },
    ],
  },
  {
    key: "technology",
    title: "NFC & authenticity",
    items: [
      {
        title: "How does NFC work?",
        body: "The technology behind contactless cards. Hold a phone within a few centimetres and it opens the bracelet's page.",
      },
      {
        title: "What does the NFC tag do?",
        body: "It holds a link with the bracelet's unique ID, checked against our register. No personal data, no battery, no tracking.",
      },
      {
        title: "Which phones support it?",
        body: "Most current smartphones — iPhone XS and later, and Android with NFC switched on. Any phone can also enter the ID on our Authenticity page.",
      },
      {
        title: "Is NFC safe?",
        body: "Yes. The tag is passive and shares only the bracelet's link, only when a phone is held to it.",
      },
      {
        title: "How is authenticity verified?",
        body: "We check the ID against the register of pieces we issued: Authentic, Reported lost, No longer valid, or Not recognised. Every check is logged and unusual patterns are reviewed. Today's tags could in principle be copied; tags that sign every tap are planned.",
      },
    ],
  },
  {
    key: "ownership",
    title: "Ownership",
    items: [
      {
        title: "How do I register my bracelet?",
        body: "In Your account → Bracelets, enter the bracelet ID and the claim code from its box.",
      },
      {
        title: "How is ownership handled?",
        body: "Its public page shows your initials, or \"a private owner\". Your name and contact details are never shown.",
      },
      {
        title: "What happens when a bracelet is transferred?",
        body: "Choose \"Transfer\" in your account and pass the new code to the next owner. The old code stops working.",
      },
      {
        title: "What happens if a bracelet is lost?",
        body: "Report it lost in your account. It stops opening doors, and a finder can contact us from its page.",
      },
    ],
  },
  {
    key: "customisation",
    title: "Materials, sizing & customisation",
    items: [
      {
        title: "What are the bracelets made of?",
        body: "The Wave in rose, the Flow in silver, the Line in black. Metal and plating are confirmed in writing before making.",
      },
      {
        title: "How does sizing work?",
        body: "Choose S, M or L when you reserve. We confirm the fit with you before your piece is made.",
      },
      {
        title: "How do I customise my bracelet?",
        body: "Start from the Base Model and choose a stone to set either side of the eye.",
      },
      {
        title: "Which gemstones are available?",
        body: "Sapphire, ruby, emerald, amethyst and diamond — always beside the eye, never over it.",
      },
      {
        title: "Can I personalise my jewellery further?",
        body: "Write to us — we will tell you honestly what is possible.",
      },
    ],
  },
  {
    key: "orders",
    title: "Pre-orders, delivery & returns",
    items: [
      {
        title: "What are pre-orders?",
        body: `${preorder.why} Nothing is charged until price, size and timing are confirmed.`,
      },
      {
        title: "Are the bracelets made to order?",
        body: "Yes — in a first run, with the stones and size you confirm.",
      },
      {
        title: "How long does delivery take, and what does it cost?",
        body: "Confirmed with you before you pay.",
      },
      {
        title: "Can I cancel or return?",
        body: "Cancel a reservation any time before you pay. Terms for paid orders are confirmed before you pay, alongside your statutory rights. See our Terms.",
      },
      {
        title: "How should I care for my bracelet?",
        body: "Store in its pouch, wipe with a soft dry cloth, and keep it from perfume, chemicals and water.",
      },
    ],
  },
  {
    key: "events",
    title: "Events & support",
    items: [
      {
        title: "How does event verification work?",
        body: "Door staff tap your bracelet and see at once whether it is authentic and on the list. Lost or deactivated bracelets are not admitted.",
      },
      {
        title: "What happens if I need support?",
        body: "Write to us through the contact page. Reservations and bracelets are in Your account.",
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);
