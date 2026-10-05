import { copy } from "@/content/copy";
import { EyeMark } from "@/components/brand/Emblem";
import { RevealText } from "@/components/ui/RevealText";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import { WaitlistForm } from "@/components/commerce/WaitlistForm";
import { preorder } from "@/config/site";

/** CONNECT — the one ask. */
export function Closing() {
  const c = copy.closing;
  return (
    <section aria-label={c.eyebrow} className="relative stage grain overflow-hidden py-[clamp(6rem,18vh,11rem)]">
      <div aria-hidden className="absolute -inset-[10%] light-beams opacity-70" />
      <div className="shell-narrow relative text-center flex flex-col items-center">
        <EyeMark className="w-12 text-[var(--c-strong)]" />
        <Reveal className="t-eyebrow mt-6">{c.eyebrow}</Reveal>
        <RevealText lines={c.headline} className="t-mega mt-6" />
        <Reveal index={2} className="t-body mt-8 max-w-[38ch]">
          <p>{c.body}</p>
        </Reveal>
        <Reveal index={3} className="mt-10">
          <Link href="/shop" className="btn-solid">
            {preorder.label} — {preorder.cta}
          </Link>
        </Reveal>
        <Reveal index={4} className="mt-14 w-full max-w-[30rem]">
          <p className="t-eyebrow mb-4">{c.waitlist}</p>
          <WaitlistForm source="home:closing" />
        </Reveal>
      </div>
    </section>
  );
}
