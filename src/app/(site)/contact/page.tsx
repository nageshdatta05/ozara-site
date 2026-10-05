import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/content/copy";
import { business, site } from "@/config/site";
import { EyeMark } from "@/components/brand/Emblem";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { ContactForm } from "@/components/commerce/ContactForm";
import { WaitlistForm } from "@/components/commerce/WaitlistForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact OZARA — the collection, reservations, your bracelet, events and press.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const c = copy.contact;
  return (
    <section className="relative stage grain overflow-hidden min-h-[100svh] pt-[calc(var(--nav-h)+10vh)] pb-[12vh]">
      <div aria-hidden className="absolute -inset-[12%] light-beams anim-beams" />
      <div className="shell relative grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-5">
          <Reveal className="t-eyebrow">{c.eyebrow}</Reveal>
          <RevealText as="h1" lines={c.headline} className="t-display mt-5" />
          <Reveal index={2} className="t-body mt-8 max-w-[40ch]">
            <p>{c.body}</p>
          </Reveal>
          <Reveal index={3} className="mt-12 space-y-8">
            {site.contactEmail && (
              <div>
                <p className="t-eyebrow mb-2">Email</p>
                <a href={`mailto:${site.contactEmail}`} className="font-display text-[1.4rem] text-strong border-b border-line hover:border-[var(--c-strong)] transition-colors">
                  {site.contactEmail}
                </a>
              </div>
            )}
            <div>
              <p className="t-eyebrow mb-2">Instagram</p>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="font-display text-[1.4rem] text-strong border-b border-line hover:border-[var(--c-strong)] transition-colors">
                @ozara.co
              </a>
            </div>
            {(business.legalName || business.address) && (
              <div className="text-[0.92rem] text-muted">
                {business.legalName && <p>{business.legalName}</p>}
                {business.address && <p>{business.address}</p>}
              </div>
            )}
            <div className="border-t border-line pt-6 flex gap-4 max-w-[40ch]">
              <EyeMark className="w-6 shrink-0 mt-1 text-[var(--c-strong)]" />
              <p className="text-[0.95rem] text-muted">
                Organising an {site.brand} event? Door staff verify bracelets at{" "}
                <Link href="/verify" className="underline underline-offset-4 text-strong">
                  Event verification
                </Link>{" "}
                with the organiser code we provide.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="lg:col-span-6 lg:col-start-7 space-y-14">
          <Reveal index={1}>
            <p className="t-eyebrow mb-5">Write to us</p>
            <ContactForm initialTopic={topic} />
          </Reveal>
          <Reveal index={2} className="border-t border-line pt-10">
            <p className="t-eyebrow mb-4">The waiting list</p>
            <WaitlistForm source="contact" layout="stacked" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
