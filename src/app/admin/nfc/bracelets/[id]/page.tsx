import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/session";
import { displayStatus, eligibilityFor, findBracelet, logsForBracelet } from "@/server/bracelets";
import { tagUrl } from "@/server/urls";
import { products } from "@/data/products";
import { formatDate, formatWhen } from "@/lib/format";
import { Badge, resultBadge, statusTone } from "@/components/nfc/Badge";
import { BraceletActions } from "@/components/admin/BraceletActions";

export const dynamic = "force-dynamic";

export default async function BraceletDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ registered?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { registered } = await searchParams;
  const b = findBracelet(id);
  if (!b) notFound();
  const s = displayStatus(b);
  const logs = logsForBracelet(b.id);
  const elig = eligibilityFor(b.id);
  const product = products.find((p) => p.slug === b.product_slug);

  const rows: [string, React.ReactNode, boolean?][] = [
    ["Authenticity", b.status === "active" ? <Badge tone="good">Verified</Badge> : <Badge tone="bad">Not valid</Badge>],
    ["Status", <span className="flex gap-1.5" key="s"><Badge tone={b.status === "active" ? "good" : b.status === "suspended" ? "warn" : "bad"}>{b.status === "active" ? "Active" : b.status === "suspended" ? "Suspended" : "Revoked"}</Badge>{b.status === "active" && <Badge tone={statusTone(s)}>{s}</Badge>}</span>],
    ...(b.is_demo ? ([["Record type", <Badge tone="warn" key="d">Demo / test record</Badge>]] as [string, React.ReactNode][]) : []),
    ["NFC identifier", <span className="tabular-nums" key="u">{b.nfc_uid ?? "Not recorded"}</span>, true],
    ["Tag URL", <span className="tabular-nums break-all" key="t">{tagUrl(b.bracelet_id)}</span>, true],
    ["Verification method", b.verification_method === "url_id" ? "Identifier + database lookup" : b.verification_method],
    [
      "Owner",
      b.owner_display_name
        ? `${b.owner_display_name}${b.owner_customer_id ? " · customer account" : ""} — public page shows ${b.owner_visibility === "private" ? "“a private owner”" : `“${b.owner_public_label ?? "a private owner"}”`}`
        : "Unregistered",
    ],
    ["Claim code", b.claim_code_hash ? "Issued (stored as a hash)" : "None — issue one below"],
    ["Order", b.order_ref ?? "—"],
    ["Product", product?.name ?? "—"],
    ["Batch", b.batch ?? "—"],
    ["Created", formatDate(b.created_at)],
    ["Last scanned", formatWhen(b.last_scanned_at)],
  ];
  if (b.revoked_reason) rows.push([b.status === "suspended" ? "Suspension reason" : "Reason", b.revoked_reason]);
  if (b.notes) rows.push(["Notes", b.notes]);

  return (
    <div>
      <Link href="/admin/nfc/bracelets" className="btn-text !text-[var(--c-ink-muted)] !text-[12px]">← All bracelets</Link>

      {registered && (
        <p role="status" className="mt-6 border border-[#bfd9c8] bg-[#e3efe7] px-4 py-3 text-[1rem] text-[#1d5b3a]">
          Registered. Write <span className="tabular-nums font-medium">{tagUrl(b.bracelet_id)}</span> onto the NFC tag as a URL record, then tap it to test.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="t-eyebrow">Bracelet</p>
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-none mt-2 tabular-nums">{b.bracelet_id}</h1>
        </div>
        <a href={`/b/${b.bracelet_id}`} target="_blank" rel="noreferrer" className="btn-line">
          Open public page ↗
        </a>
      </div>

      {b.review_status === "review_recommended" && (
        <p className="mt-6 border border-[#e8d6ad] bg-[#f7efdd] px-4 py-3 text-[1rem] text-[#7a5410]">
          <strong className="font-medium">Review recommended.</strong> {b.review_note} This is a prompt to look, not a verdict.
        </p>
      )}

      <div className="mt-10 grid lg:grid-cols-12 gap-12">
        <section className="lg:col-span-7">
          <dl className="border-t border-[var(--c-ink-line)]">
            {rows.map(([k, v, locked]) => (
              <div key={k} className="grid grid-cols-[10rem_1fr] sm:grid-cols-[12rem_1fr] gap-4 py-3.5 border-b border-[var(--c-ink-line)] text-[0.93rem]">
                <dt className="t-eyebrow !text-[12px] pt-0.5 flex items-center gap-1.5">
                  {k}
                  {locked && <span title="Permanent" aria-label="Permanent" className="opacity-60">·</span>}
                </dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <h2 id="history" className="t-eyebrow !text-[var(--c-ink)] mt-14">Authentication history · {logs.length}</h2>
          {logs.length === 0 ? (
            <p className="mt-4 text-[1rem] text-[var(--c-ink-muted)]">Not scanned yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[0.95rem]">
                <thead>
                  <tr className="border-y border-[var(--c-ink-line)] text-[0.66rem] uppercase tracking-[0.14em] text-[var(--c-ink-muted)]">
                    <th className="py-2.5 pr-4 font-medium">Date / time</th>
                    <th className="py-2.5 pr-4 font-medium">Result</th>
                    <th className="py-2.5 pr-4 font-medium">Where</th>
                    <th className="py-2.5 font-medium">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-b border-[var(--c-ink-line)]">
                      <td className="py-3 pr-4 whitespace-nowrap">{formatWhen(l.created_at)}</td>
                      <td className="py-3 pr-4">
                        <span className="flex flex-wrap gap-1.5">
                          {resultBadge(l.result)}
                          {l.flag === "review_recommended" && <Badge tone="warn">Review</Badge>}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {l.channel === "event" ? `${l.event_name} · ${l.eligibility === "eligible" ? "eligible" : l.eligibility === "not_eligible" ? "not eligible" : "refused"}` : l.channel === "public" ? "Public tap" : "Admin"}
                      </td>
                      <td className="py-3 text-[var(--c-ink-muted)]">{l.device ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="lg:col-span-5">
          <BraceletActions
            bracelet={{
              id: b.bracelet_id,
              status: b.status,
              nfcUid: b.nfc_uid,
              productSlug: b.product_slug,
              batch: b.batch,
              notes: b.notes,
              owner: b.owner_display_name ? { displayName: b.owner_display_name, publicLabel: b.owner_public_label ?? "" } : null,
              review: b.review_status === "review_recommended",
            }}
            eligibility={elig.map((e) => ({ eventId: e.event_id, name: e.name, eventStatus: e.event_status, status: e.status }))}
            products={products.map((p) => ({ slug: p.slug, name: p.name }))}
          />
        </aside>
      </div>
    </div>
  );
}
