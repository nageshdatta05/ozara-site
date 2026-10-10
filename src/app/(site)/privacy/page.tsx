import type { Metadata } from "next";
import { LegalPage, whoWeAre, type LegalSection } from "@/components/legal/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How OZARA handles account, order, ownership, NFC verification, event and waiting-list information.",
  alternates: { canonical: "/privacy" },
};

const sections: LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    body: [`This policy explains how ${whoWeAre()} ("we", "us") collects and uses personal information through this website, our bracelets' NFC pages and our events.`],
  },
  {
    id: "collect",
    title: "What we collect",
    body: [
      "We collect only what each part of the service needs:",
      [
        "Account: your name, email address, optional phone number and a securely hashed password (we never store your password itself).",
        "Reservations and orders: your name, email, optional phone, delivery address, the pieces, stones and size you chose, and any note you add.",
        "Bracelet ownership: which bracelets are registered to your account, when, and whether you show your initials on their public pages.",
        "Your tap page (optional): if you add one, the name, line, photo, phone, email, website, Instagram and LinkedIn details you enter, and which of them you have switched on.",
        "Waiting list: your email address and which piece or page you signed up from.",
        "Contact enquiries: your name, email, topic and message.",
        "Bracelet verification: when a bracelet's page is opened we record the bracelet identifier, the result, the time and a coarse device type (mobile or desktop). We do not record IP addresses or location in this log.",
        "Event verification: when door staff check a bracelet we record the bracelet, the event, the result, the time, the staff member's name and a non-identifying code for their device session.",
      ],
    ],
  },
  {
    id: "public",
    title: "What is shown publicly",
    body: [
      "A bracelet's public page shows the piece, whether it is authentic and active, whether it is registered to an owner, and — only if the owner chooses — the owner's initials. Owners can switch this to \"a private owner\" at any time in their account.",
      "Owners can also publish a tap page. Only the details an owner has switched on are shown, to anyone who taps or opens that bracelet's link. Details an owner has not switched on are never shown, and owners can hide, change or remove them at any time. A tap page and its photo are erased when the bracelet is transferred or the account is deleted.",
      "Apart from what an owner chooses to publish, we never show names, email addresses or phone numbers publicly, and we never show the NFC chip's internal identifier.",
    ],
  },
  {
    id: "use",
    title: "How we use it",
    body: [
      [
        "To create and run your account and keep it secure.",
        "To handle your reservation or order: confirming price, size, delivery and payment with you, making and delivering your piece.",
        "To register bracelets to their owners, show authenticity on their public pages, and show owners' tap pages as they have chosen.",
        "To admit eligible bracelet holders to OZARA events and keep a record of door checks.",
        "To detect misuse — for example unusual patterns of scans — so a person can review it.",
        "To reply to your messages and, if you joined the waiting list, to tell you about OZARA.",
      ],
      "We do not sell personal information, and we do not use it for advertising profiles.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: [
      "We use only cookies that the service needs to work: to keep you signed in to your account, to keep event staff and administrators signed in, and to let your browser show the confirmation of a reservation you just placed. Your shopping bag is kept in your browser's local storage on your device.",
      "We do not currently use analytics or advertising cookies. If that changes we will update this policy and ask for consent where the law requires it.",
    ],
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: [
      "We share information only with providers that help us run the service — website hosting, email delivery and, once connected, payment processing — and only as needed for that purpose, and with our manufacturing partners where your order details are needed to make your piece. We may disclose information where the law requires it.",
    ],
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: [
      "We keep account information until you delete your account. Order records are kept for as long as we need them to fulfil the order, provide after-sales care and meet legal and accounting obligations. Verification and event logs are kept for as long as they are needed to protect bracelet owners and our events from misuse. Waiting-list entries are kept until you ask us to remove you. We review records and delete those we no longer need.",
    ],
  },
  {
    id: "rights",
    title: "Your choices and rights",
    body: [
      "You can view and change your details, choose what your bracelets' public pages show, transfer bracelets and delete your account from your account page at any time. Deleting your account releases your bracelets and removes your details; order records we must keep are retained without a link to an account.",
      "Depending on where you live you may also have rights to access, correct, delete or receive a copy of your information, to object to or restrict some uses, and to complain to your data-protection authority. To make a request, contact us using the details below.",
    ],
  },
  {
    id: "security",
    title: "Security",
    body: [
      "Passwords and codes are stored only as one-way hashes; sessions use signed, http-only cookies; and staff and administrator areas require separate sign-in. No system is perfectly secure, so please use a password you don't use elsewhere and tell us if you think your account has been misused.",
    ],
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: [`If we change how we use personal information we will update this page and its date. For any privacy question or request, contact ${site.brand} through our contact page.`],
  },
];

export default function PrivacyPage() {
  return <LegalPage eyebrow="Legal" title="Privacy Policy" intro="Plainly: what we collect, why, what is ever shown publicly, and your choices." sections={sections} />;
}
