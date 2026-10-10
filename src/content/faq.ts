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
        body: `A luxury bracelet with NFC technology inside. Tap it to a phone and your personal page, your ${site.brand} ID, opens, showing the details and links you choose to share. Collection 01 is three designs: the Wave, the Flow and the Line.`,
      },
      {
        title: "What makes OZARA different?",
        body: "It is jewellery first, and your identity in one tap. Each piece is registered to its owner; a tap opens the page they chose to share and shows it is genuine.",
      },
      {
        title: "Is it a one-off?",
        body: "No. It is jewellery you keep and wear every day. You can change what your page shows whenever you like.",
      },
      {
        title: "Is it a good gift?",
        body: "Yes. Whoever receives it registers it to their own account with the claim code in the box, and makes the page their own.",
      },
      {
        title: "Can my club or organisation order for its members?",
        body: "Write to us through the Contact page with a few details about your organisation and how many bands you need. We will tell you honestly what is possible.",
      },
      {
        title: "What does the Eye represent?",
        body: "Our emblem — a ring and a four-pointed star — set into the metal. It is the tap point: hold the Eye to a phone and your OZARA ID, your personal page, opens.",
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
        body: "The technology behind contactless cards. Hold a phone within a few centimetres and it opens your personal page in the phone's browser.",
      },
      {
        title: "Does a tap share everything on my phone?",
        body: "No. The tag only opens a web page on our website. You decide what appears on it, and nothing stored on your phone is sent.",
      },
      {
        title: "What can I put on my page?",
        body: "Your name, a line under it, a photo, phone, email, website, Instagram and LinkedIn. Every one is optional, and you can show, hide or change any of them at any time from Your account.",
      },
      {
        title: "How is my information protected?",
        body: "Only what you switch on is shown. Anyone who taps your bracelet, or opens its link, can see those details, so share only what you are happy for them to see. Anything switched off is never shown. You can change or turn off your page at any time, and it is erased if you transfer the bracelet or delete your account.",
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
        body: "Until you add a page, its public page shows only your initials, or \"a private owner\". Your name and contact details appear only if you choose to put them on your page.",
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
        body: "Start from the Base Model — the Eye alone — or choose a stone. Stones are set along the band and at the centre of the star; how many is up to you.",
      },
      {
        title: "Which gemstones are available?",
        body: "Sapphire, ruby, emerald, amethyst and diamond — set along the band and at the centre of the star. The Base Model has no stones.",
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
        body: `${preorder.why} Base Models are ₹15,000, paid securely at checkout. Pieces with stones are priced by the number of stones: we agree it with you, then send a secure payment link.`,
      },
      {
        title: "Are the bracelets made to order?",
        body: "Yes — in a first run, with the stones and size you confirm.",
      },
      {
        title: "How long does delivery take, and what does it cost?",
        body: "For Base Models, delivery is shown at checkout. For pieces with stones, it is confirmed with you before you pay.",
      },
      {
        title: "Can I cancel or return?",
        body: "You can cancel a reservation any time before you pay. Every piece is made to order; the terms for paid orders are in our Terms, alongside your statutory rights.",
      },
      {
        title: "What if my bracelet is damaged?",
        body: "Write to us through the Contact page and we will look at it with you. Repair and warranty terms are confirmed in writing.",
      },
      {
        title: "How should I care for my bracelet?",
        body: "Store in its pouch, wipe with a soft dry cloth, and keep it from perfume, chemicals and water.",
      },
    ],
  },
  {
    key: "support",
    title: "Support",
    items: [
      {
        title: "What happens if I need support?",
        body: "Write to us through the contact page. Reservations and bracelets are in Your account.",
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);
