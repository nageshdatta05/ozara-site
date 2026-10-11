"use client";

import Link from "next/link";
import { useState } from "react";
import { copy } from "@/content/copy";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { ConceptTag } from "@/components/ui/ConceptTag";
import { ProfileCard } from "@/components/nfc/ProfileCard";
import type { CardStyle, PublicProfile } from "@/server/profiles";

/* An example, not a real person: made-up details, so visitors can see exactly
   what an owner's page looks like after a tap. */
const EXAMPLE: Omit<PublicProfile, "cardStyle"> = {
  name: "Alex Morgan",
  headline: "Creative Director, Studio Morgan",
  location: "London",
  bio: "Quietly useful design, and always up for a good conversation.",
  photo: true,
  phone: "+1 555 010 0199",
  email: "hello@yourname.com",
  website: "https://yourname.com",
  instagram: "yourname",
  linkedin: "https://www.linkedin.com/in/yourname",
};
const EXAMPLE_PHOTO = "/media/demo/profile.jpg";

const FINISHES: { key: CardStyle; label: string; swatch: string }[] = [
  { key: "midnight", label: "Midnight", swatch: "linear-gradient(135deg,#1b2a78,#00072b)" },
  { key: "burgundy", label: "Burgundy", swatch: "linear-gradient(135deg,#8a1a26,#3d0103)" },
  { key: "ivory", label: "Ivory", swatch: "linear-gradient(135deg,#fffdf9,#ddd3c1)" },
];

/**
 * UNDERSTAND → IDENTIFY → CONNECT.
 * The owner's own page, shown as it appears after a tap: two business cards,
 * front and back, in a finish the visitor can try.
 */
export function Identity() {
  const c = copy.identity;
  const [finish, setFinish] = useState<CardStyle>("midnight");
  const points = c.faces.slice(0, 3);

  return (
    <section id="identity" aria-label={c.eyebrow} className="relative bg-linen section-pad overflow-hidden">
      <div className="shell grid lg:grid-cols-12 gap-14 lg:gap-12 items-center">
        <div className="lg:col-span-5 lg:order-1">
          <Reveal className="t-eyebrow mb-6">{c.eyebrow}</Reveal>
          <RevealText lines={c.headline} className="t-title" />
          <Reveal index={2} className="t-body mt-6 max-w-[38ch]">
            <p>{c.body}</p>
          </Reveal>

          <ol className="mt-10 border-t border-line">
            {points.map((f, i) => (
              <li key={f.key} className="py-4 border-b border-line grid grid-cols-[2.5rem_1fr] items-baseline">
                <span className="t-eyebrow tabular-nums">0{i + 1}</span>
                <span>
                  <span className="font-display text-[1.25rem] block text-[var(--c-strong)]">{f.tab}</span>
                  <span className="block pt-1 text-[1rem] text-muted max-w-[36ch]">{f.line}</span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
            <Link href="/technology" className="link-quiet">
              {c.link}
              <span className="rule" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:order-2 flex flex-col items-center">
          <ProfileCard p={{ ...EXAMPLE, cardStyle: finish }} braceletId="OZ-EXAMPLE" demo photoSrc={EXAMPLE_PHOTO} />

          <div className="mt-8 flex flex-col items-center gap-4">
            <fieldset className="flex items-center gap-5">
              <legend className="sr-only">Card finish</legend>
              {FINISHES.map((f) => (
                <label key={f.key} className="flex items-center gap-2.5 text-[0.9rem] cursor-pointer">
                  <input type="radio" name="home-finish" className="sr-only peer" checked={finish === f.key} onChange={() => setFinish(f.key)} />
                  <span
                    aria-hidden
                    className="block h-7 w-11 rounded-[5px] ring-1 ring-[var(--c-line-strong)] peer-checked:ring-2 peer-checked:ring-[var(--c-accent)] peer-focus-visible:outline peer-focus-visible:outline-2"
                    style={{ background: f.swatch }}
                  />
                  <span className="hidden sm:inline">{f.label}</span>
                </label>
              ))}
            </fieldset>
            <ConceptTag>An example. Owners choose their own details.</ConceptTag>
          </div>
        </div>
      </div>
    </section>
  );
}
