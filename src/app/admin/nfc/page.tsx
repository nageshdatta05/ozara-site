import Link from "next/link";
import { requireAdmin } from "@/server/session";
import { listBracelets, listEvents, recentLogs, stats } from "@/server/bracelets";
import { formatWhen } from "@/lib/format";
import { Badge, resultBadge } from "@/components/nfc/Badge";

export const dynamic = "force-dynamic";

export default async function NfcOverview() {
  await requireAdmin();
  const s = stats();
  const logs = recentLogs(10);
  const flagged = listBracelets({ status: "review" });
  const events = listEvents().filter((e) => e.status !== "ended");

  const tiles: [string, number, string][] = [
    ["Total bracelets", s.total, "/admin/nfc/bracelets"],
    ["Active", s.active, "/admin/nfc/bracelets?status=active"],
    ["Unregistered", s.unclaimed, "/admin/nfc/bracelets?status=unclaimed"],
    ["Registered", s.claimed, "/admin/nfc/bracelets?status=claimed"],
    ["Suspended", s.suspended, "/admin/nfc/bracelets?status=suspended"],
    ["Revoked", s.revoked, "/admin/nfc/bracelets?status=revoked"],
    ["Event-eligible", s.eventEligible, "/admin/nfc/events"],
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="t-eyebrow">Overview</p>
          <h1 className="t-title mt-2">Bracelet register</h1>
        </div>
        <Link href="/admin/nfc/bracelets/new" className="btn-solid">
          Register a bracelet
        </Link>
      </div>

      <ul className="mt-10 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 border-t border-l border-[var(--c-ink-line)]">
        {tiles.map(([label, n, href]) => (
          <li key={label} className="border-r border-b border-[var(--c-ink-line)]">
            <Link href={href} className="block p-5 hover:bg-white/60 transition-colors">
              <p className="t-eyebrow !text-[12px]">{label}</p>
              <p className="font-display text-[2.4rem] leading-none mt-3 tabular-nums">{n}</p>
            </Link>
          </li>
        ))}
      </ul>

      {flagged.length > 0 && (
        <section className="mt-10 border border-[#e8d6ad] bg-[#f7efdd] p-5">
          <p className="t-eyebrow !text-[#7a5410]">Review recommended · {flagged.length}</p>
          <ul className="mt-3 space-y-2">
            {flagged.map((b) => (
              <li key={b.id} className="flex flex-wrap gap-x-4 text-[1rem]">
                <Link href={`/admin/nfc/bracelets/${b.bracelet_id}`} className="underline underline-offset-4 tabular-nums">{b.bracelet_id}</Link>
                <span className="text-[var(--c-ink-muted)]">{b.review_note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-14 grid lg:grid-cols-12 gap-12">
        <section className="lg:col-span-7">
          <h2 className="t-eyebrow !text-[var(--c-ink)]">Recent scans</h2>
          {logs.length === 0 ? (
            <p className="mt-4 text-[1rem] text-[var(--c-ink-muted)]">No scans yet. Open a bracelet link to create one.</p>
          ) : (
            <ul className="mt-4 border-t border-[var(--c-ink-line)]">
              {logs.map((l) => (
                <li key={l.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[9rem_1fr_auto] gap-x-4 gap-y-1 items-center py-3.5 border-b border-[var(--c-ink-line)]">
                  <span className="tabular-nums tracking-[0.06em] text-[1.02rem]">
                    {l.bracelet_pk ? <Link href={`/admin/nfc/bracelets/${l.presented_id}`} className="hover:underline underline-offset-4">{l.presented_id}</Link> : l.presented_id}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 order-3 sm:order-none col-span-2 sm:col-span-1">
                    {resultBadge(l.result)}
                    {l.channel === "event" && (
                      <span className="text-[0.875rem] text-[var(--c-ink-muted)]">
                        {l.event_name} · {l.eligibility === "eligible" ? "admitted" : l.eligibility === "not_eligible" ? "not eligible" : "refused"}
                      </span>
                    )}
                    {l.flag === "review_recommended" && <Badge tone="warn">Review</Badge>}
                  </span>
                  <span className="text-[0.9rem] text-[var(--c-ink-muted)] text-right whitespace-nowrap">{formatWhen(l.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-5">
          <h2 className="t-eyebrow !text-[var(--c-ink)]">Events</h2>
          <ul className="mt-4 border-t border-[var(--c-ink-line)]">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 py-3.5 border-b border-[var(--c-ink-line)]">
                <span>
                  <span className="block text-[1.05rem]">{e.name}</span>
                  <span className="text-[0.875rem] text-[var(--c-ink-muted)]">{e.starts_at ? formatWhen(e.starts_at) : "Date to be set"}</span>
                </span>
                <Badge tone={e.status === "live" ? "good" : "neutral"}>{e.status}</Badge>
              </li>
            ))}
          </ul>
          <Link href="/admin/nfc/events" className="btn-text !text-[var(--c-ink)] mt-5 inline-block">Manage events</Link>
          <p className="mt-8 text-[0.92rem] text-[var(--c-ink-muted)]">
            Door staff verify at <span className="tabular-nums">/verify</span> with the event&rsquo;s organiser code — no admin access needed.
          </p>
        </section>
      </div>
    </div>
  );
}
