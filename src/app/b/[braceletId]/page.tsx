import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { authenticate, verifyForEvent } from "@/server/verification";
import { deviceClass, organiserSession } from "@/server/session";
import { formatMonth, formatWhen } from "@/lib/format";
import { contactHref, site } from "@/config/site";
import { Emblem, Wordmark } from "@/components/brand/Emblem";
import { ResultMark } from "@/components/nfc/ResultMark";
import { BraceletEventCheck } from "@/components/nfc/BraceletEventCheck";

// Always ask the backend — never cache an authentication result.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ braceletId: string }>; searchParams: Promise<Record<string, string>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { braceletId } = await params;
  return { title: `Bracelet ${decodeURIComponent(braceletId).toUpperCase().slice(0, 40)}`, robots: { index: false, follow: false } };
}

/**
 * PUBLIC AUTHENTICATION — the URL written into every NFC tag:
 *   https://<domain>/b/<BRACELET_ID>
 * The result comes from the bracelet's database record. Publicly visible:
 * the piece, its status, whether it is registered, and — only if the owner
 * allows it — the owner's initials. Never the NFC UID, a name or an email.
 */
export default async function BraceletPage({ params, searchParams }: Props) {
  const { braceletId } = await params;
  const proof = await searchParams;
  const h = await headers();
  // link prefetches and previews must not be logged as scans
  const prefetch = /prefetch/i.test(`${h.get("next-router-prefetch") ?? ""}${h.get("purpose") ?? ""}${h.get("sec-purpose") ?? ""}`);
  const device = await deviceClass();

  // An event organiser tapping a bracelet gets the door result for their event.
  const organiser = await organiserSession();
  if (organiser) {
    const v = verifyForEvent(braceletId, organiser.event.id, { channel: "event", device, sessionHash: organiser.sessionHash, verifiedBy: organiser.who, proof, dryRun: prefetch });
    return <BraceletEventCheck v={v} />;
  }

  const r = authenticate(braceletId, { channel: "public", device, proof, dryRun: prefetch });
  const demo = r.kind !== "not_recognized" && r.demo;

  return (
    <main className="relative min-h-[100svh] flex flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 stage grain" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            r.kind === "authentic"
              ? "radial-gradient(60% 40% at 50% 32%, rgb(169 185 214 / 0.35), transparent 70%)"
              : "radial-gradient(60% 40% at 50% 32%, rgb(205 191 174 / 0.5), transparent 70%)",
        }}
      />

      {demo && (
        <p className="relative z-10 bg-[var(--c-burgundy)] text-[var(--c-paper)] text-center text-[0.875rem] px-4 py-2.5" role="note">
          Demonstration record — this is a test bracelet, not a customer&rsquo;s piece.
        </p>
      )}

      <header className="relative flex justify-center pt-8">
        <Link href="/" aria-label={`${site.brand} home`} className="flex flex-col items-center gap-3 text-[var(--c-strong)]">
          <Wordmark label={null} className="h-[1.6rem]" />
        </Link>
      </header>

      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
        {r.kind === "authentic" && (
          <>
            <ResultMark kind="ok" tone="light" className="w-28 sm:w-32" />
            <p className="t-eyebrow mt-8 !text-[var(--c-accent)]">Authentic {site.brand} bracelet</p>
            <h1 className="t-display !text-[clamp(2.4rem,11vw,3.6rem)] leading-none mt-4">Authentic</h1>
            <p className="t-body mt-5 max-w-[32ch]">
              This bracelet is in the {site.brand} register and is active{r.productName ? ` — ${r.productName}` : ""}.
            </p>

            <dl className="mt-10 w-full max-w-sm text-left">
              <Row k="Bracelet" v={r.braceletId} mono />
              {r.productName && <Row k="Piece" v={r.productName} />}
              <Row k="Status" v="Active" good />
              <Row k="Issued by" v={site.brand} />
              <Row k="Issued" v={formatMonth(r.issuedAt)} />
              <Row
                k="Registration"
                v={
                  r.registered
                    ? (r.ownerLabel ? `Registered to ${r.ownerLabel}` : "Registered to a private owner") + (r.registeredSince ? ` · since ${formatMonth(r.registeredSince)}` : "")
                    : "Not yet registered to an owner"
                }
              />
            </dl>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              {r.productSlug && (
                <Link href={`/shop/${r.productSlug}`} className="btn-line">
                  Discover the piece
                </Link>
              )}
              {!r.registered && !demo && (
                <Link href={`/account/bracelets?claim=${encodeURIComponent(r.braceletId)}`} className="btn-solid">
                  Is this yours? Register it
                </Link>
              )}
            </div>
          </>
        )}

        {r.kind === "suspended" && (
          <>
            <ResultMark kind="revoked" tone="light" className="w-28 sm:w-32" />
            <p className="t-eyebrow mt-8 !text-[var(--c-burgundy)]">Bracelet {r.braceletId}</p>
            <h1 className="t-display !text-[clamp(2.1rem,9vw,3.2rem)] leading-tight mt-4">Reported lost</h1>
            <p className="t-body mt-5 max-w-[34ch]">
              This is a genuine {site.brand} bracelet{r.productName ? ` (${r.productName})` : ""}, but its owner has reported it lost, so it is temporarily inactive. If you have found it, please let us know.
            </p>
            <a href={contactHref(`Found bracelet ${r.braceletId}`)} className="btn-line mt-10">
              I&rsquo;ve found this bracelet
            </a>
          </>
        )}

        {r.kind === "revoked" && (
          <>
            <ResultMark kind="revoked" tone="light" className="w-28 sm:w-32" />
            <p className="t-eyebrow mt-8 !text-[var(--c-burgundy)]">Bracelet {r.braceletId}</p>
            <h1 className="t-display !text-[clamp(2.1rem,9vw,3.2rem)] leading-tight mt-4">No longer valid</h1>
            <p className="t-body mt-5 max-w-[34ch]">{site.brand} has deactivated this bracelet. If you believe this is a mistake, please contact us.</p>
            <a href={contactHref(`Bracelet ${r.braceletId}`)} className="btn-line mt-10">
              Contact {site.brand}
            </a>
          </>
        )}

        {r.kind === "not_recognized" && (
          <>
            <ResultMark kind="unknown" tone="light" className="w-28 sm:w-32" />
            <p className="t-eyebrow mt-8 !text-[#8a6a2c]">Not recognised</p>
            <h1 className="t-display !text-[clamp(2.1rem,9vw,3.2rem)] leading-tight mt-4">Bracelet not recognised</h1>
            <p className="t-body mt-5 max-w-[34ch]">
              We couldn&rsquo;t find this identifier in the {site.brand} register. That doesn&rsquo;t necessarily mean anything is wrong — the link may be mistyped or damaged. Please contact us and we&rsquo;ll help.
            </p>
            <a href={contactHref("Bracelet verification")} className="btn-line mt-10">
              Contact {site.brand}
            </a>
          </>
        )}
      </section>

      <footer className="relative pb-8 px-6 text-center">
        <p className="text-[0.82rem] text-faint">Checked {formatWhen(r.checkedAt)}</p>
        <p className="text-[0.82rem] text-faint mt-2 max-w-[42ch] mx-auto">
          Shown publicly: the piece, its status and whether it is registered — and the owner&rsquo;s initials only if they choose. Never names, emails or the chip&rsquo;s identifier.
        </p>
        <Link href="/authenticity" className="btn-text !text-[12px] mt-4 inline-block">
          How verification works
        </Link>
      </footer>
    </main>
  );
}

function Row({ k, v, mono, good }: { k: string; v: string; mono?: boolean; good?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-t border-line py-3.5">
      <dt className="t-eyebrow !text-[12px]">{k}</dt>
      <dd className={`text-right text-[1.02rem] ${mono ? "tabular-nums tracking-[0.14em]" : ""} ${good ? "uppercase tracking-[0.16em] text-[0.875rem] text-[#2f6e4f]" : "text-[var(--c-strong)]"}`}>{v}</dd>
    </div>
  );
}
