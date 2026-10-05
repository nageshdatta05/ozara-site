import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { Emblem, EyeMark } from "@/components/brand/Emblem";
import { media } from "@/data/media";
import { VerifyLookup } from "@/components/nfc/VerifyLookup";

export const metadata: Metadata = {
  title: "Authenticity",
  description: "Verify an OZARA bracelet: tap it with your phone, or enter its bracelet ID.",
  alternates: { canonical: "/authenticity" },
};

const STEPS = [
  ["Tap", "Hold your phone to the bracelet. Its link opens — no app required."],
  ["Checked", `${site.brand} looks the bracelet up in its register of issued pieces.`],
  ["Result", "You see at once whether it is authentic, active and registered to an owner."],
];

export default function AuthenticityPage() {
  return (
    <>
      <section className="relative stage grain overflow-hidden pt-[calc(var(--nav-h)+10vh)] pb-[var(--space-section)]">
        <div aria-hidden className="absolute -inset-[12%] light-beams anim-beams" />
        <div className="shell relative grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="t-eyebrow flex items-center gap-3">
              <EyeMark className="w-6 text-[var(--c-strong)]" />
              Authenticity
            </p>
            <h1 className="t-display mt-5">Every piece can prove where it came from.</h1>
            <p className="t-body mt-6 max-w-[42ch]">
              Each {site.brand} bracelet carries an NFC tag linked to our register. Hold the eye to a phone — or enter the bracelet ID — to verify it.
            </p>
            <div className="mt-10 max-w-[30rem]">
              <VerifyLookup />
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="relative aspect-[1224/668] overflow-hidden">
              <Image src={media.nfcEye.src} alt={media.nfcEye.alt} fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper section-pad">
        <div className="shell grid md:grid-cols-3 gap-10">
          {STEPS.map(([t, b], i) => (
            <div key={t} className="border-t border-[var(--c-line-strong)] pt-6">
              <p className="t-eyebrow tabular-nums !text-[var(--c-accent)]">0{i + 1}</p>
              <p className="t-subtitle mt-3">{t}</p>
              <p className="t-body mt-2 max-w-[32ch]">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-theme="light" className="theme-light bg-linen section-pad">
        <div className="shell grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <Emblem className="size-14 text-[var(--c-ink)]" strokeWidth={1.2} />
            <h2 className="t-title mt-6">What the result means</h2>
          </div>
          <dl className="lg:col-span-7 lg:col-start-6 border-t border-[var(--c-ink-line)]">
            {[
              ["Authentic", "The bracelet is in our register and active. If it has been registered to an owner, we say so — without showing personal details."],
              ["No longer valid", "We have deactivated this bracelet, for example after it was reported lost. Contact us if you think this is a mistake."],
              ["Not recognized", "We couldn't find this identifier in our register. That doesn't by itself mean a piece is counterfeit — contact us and we'll help."],
            ].map(([k, v]) => (
              <div key={k} className="grid sm:grid-cols-[12rem_1fr] gap-2 sm:gap-6 py-5 border-b border-[var(--c-ink-line)]">
                <dt className="font-display text-[1.25rem]">{k}</dt>
                <dd className="t-body">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="lg:col-span-7 lg:col-start-6 text-[0.95rem] text-[var(--c-ink-muted)] space-y-3">
            <p>
              <strong className="font-medium text-[var(--c-ink)]">How it works today.</strong> The tag holds a secure web link with the bracelet&rsquo;s
              identifier; our servers check that identifier against the register and record the check. It confirms a bracelet is one we issued and
              its current status. Cryptographic tags, which make a tag itself impossible to copy, are planned for future pieces.
            </p>
            <p>
              Organising an event? Door staff verify at <Link href="/verify" className="underline underline-offset-4">/verify</Link> with the organiser code we provide.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
