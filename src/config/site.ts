/* ==========================================================================
   SITE CONFIG — brand, navigation, footer, contact, business details.

   Values that differ between environments come from environment variables
   (see .env.example). NEXT_PUBLIC_* values are safe to show in the browser;
   never put secrets in them.
   ========================================================================== */

const env = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export const site = {
  brand: "OZARA",
  tagline: "Wear your status. Unlock your world.",
  description:
    "OZARA — a luxury bracelet that marks you as part of OZARA, with your own OZARA ID and access to OZARA Exclusive and OZARA Approved events. One bracelet, every event after.",
  /** Canonical public address, e.g. https://ozara.co (no trailing slash). */
  url: (env(process.env.NEXT_PUBLIC_SITE_URL) ?? env(process.env.OZARA_PUBLIC_URL) ?? "http://localhost:3000").replace(/\/$/, ""),
  /** Public contact address. When unset, the site sends people to the contact form instead. */
  contactEmail: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  instagram: "https://www.instagram.com/ozara.co/",
  year: new Date().getFullYear(),
};

/** "Write to us" — the email address if published, otherwise the contact form. */
export const contactHref = (topic?: string) =>
  site.contactEmail
    ? `mailto:${site.contactEmail}${topic ? `?subject=${encodeURIComponent(`${site.brand} — ${topic}`)}` : ""}`
    : `/contact${topic ? `?topic=${encodeURIComponent(topic)}` : ""}`;

/**
 * BUSINESS & LEGAL DETAILS — used on the Privacy, Terms and Contact pages.
 * Anything left null is simply left out of those pages. Have the final
 * wording reviewed by a lawyer in the country you trade from.
 */
export const business = {
  /** Registered legal name, e.g. "OZARA Ltd". */
  legalName: env(process.env.NEXT_PUBLIC_LEGAL_NAME),
  /** Registered address, one line. */
  address: env(process.env.NEXT_PUBLIC_LEGAL_ADDRESS),
  /** Company / registration number. */
  registration: env(process.env.NEXT_PUBLIC_LEGAL_REGISTRATION),
  /** Country whose law governs the Terms, e.g. "England and Wales". */
  governingLaw: env(process.env.NEXT_PUBLIC_GOVERNING_LAW),
  /** Date the current Privacy Policy and Terms took effect. */
  policiesUpdated: "3 October 2026",
};

/* ==========================================================================
   COMMERCE & TRUST — fill these in as they are confirmed. Anything left empty
   is simply not shown.
   ========================================================================== */

export const launch = {
  /** Shown instead of a price while the price is not yet confirmed. */
  status: "Price on confirmation",
  note: "Join the list for first access.",
};

/**
 * PRE-ORDER — Collection 01 is offered by pre-order first. Every line here is
 * shown on the site, so keep it true: edit it as the plan firms up.
 */
export const preorder = {
  label: "Pre-Order",
  cta: "Reserve yours",
  headline: "Collection 01 is open for pre-order.",
  why: "Made in a single first run, in order of reservation.",
  /** What happens after reserving — shown on product pages and at checkout. */
  steps: [
    "Reserve — nothing is charged.",
    "We confirm price, size and timing.",
    "Made, and registered to you.",
  ],
  note: "",
};

/**
 * PAYMENTS — no payment provider is connected yet.
 * While `provider` is null, checkout places a RESERVATION: the order is saved,
 * nothing is charged, and the customer is told exactly that. To take payment,
 * connect a provider in src/server/payments.ts (see the notes there) and set
 * `provider` (e.g. "stripe").
 */
export const payments = {
  provider: null as null | "stripe",
};

/**
 * THE MAKERS — OZARA's manufacturing partners. Only facts the partner
 * publishes about itself; `url` stays null until the official page is known.
 */
export const makers: { name: string; line: string; url: string | null; source?: string }[] = [
  {
    name: "Gem Plaza",
    line: "A family jewellery house in Jaipur since 1988, with its own atelier — design, casting, stone-setting and polishing are done in house.",
    url: "https://www.gemplaza.net/heritage",
    source: "gemplaza.net",
  },
  {
    name: "Gyan",
    line: "Jewellery and gemstone partner.",
    url: null,
  },
];

/** The waiting list — stored in the site database (/admin/nfc/messages lists it). */
export const waitlist = {
  success: "You're on the list.",
  already: "You're already on the list.",
  privacy: "Only news from OZARA. Unsubscribe any time.",
};

/** Service promises — e.g. { title: "Complimentary delivery", body: "…" }. Only confirmed facts. */
export const services: { title: string; body: string }[] = [];

/** Social proof — press quotes and client words. Only real, attributable quotes. */
export const proof = {
  press: [] as { outlet: string; quote: string }[],
  testimonials: [] as { name: string; quote: string }[],
};

/** A short founder's note — adds a human face to a new brand. */
export const founder = null as null | { name: string; role: string; quote: string; image?: string };

/** Primary navigation. The opening never traps anyone: this is always one click away. */
export const nav = {
  primary: [
    { label: "Collection", href: "/shop" },
    { label: "Technology", href: "/technology" },
  ],
  secondary: [
    { label: "Authenticity", href: "/authenticity" },
    { label: "Contact", href: "/contact" },
  ],
  /** Everything, for the full-screen menu. */
  menu: [
    { label: "Home", href: "/" },
    { label: "Collection", href: "/shop" },
    { label: "Technology", href: "/technology" },
    { label: "Authenticity", href: "/authenticity" },
    { label: "About", href: "/about" },
    { label: "Questions", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
};

export const footer = {
  columns: [
    {
      title: "Collection",
      links: [
        { label: "The Wave", href: "/shop/the-wave" },
        { label: "The Flow", href: "/shop/the-flow" },
        { label: "The Line", href: "/shop/the-line" },
        { label: "All pieces", href: "/shop" },
      ],
    },
    {
      title: "The house",
      links: [
        { label: "About", href: "/about" },
        { label: "Technology", href: "/technology" },
        { label: "Authenticity", href: "/authenticity" },
        { label: "Questions", href: "/faq" },
        { label: "Verify at an event", href: "/verify" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Your account", href: "/account" },
        { label: "Instagram", href: "https://www.instagram.com/ozara.co/" },
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ],
};
