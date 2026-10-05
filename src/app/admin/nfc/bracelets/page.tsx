import Link from "next/link";
import { requireAdmin } from "@/server/session";
import { displayStatus, listBracelets } from "@/server/bracelets";
import { formatDate, formatWhen } from "@/lib/format";
import { Badge, statusTone } from "@/components/nfc/Badge";

export const dynamic = "force-dynamic";

const FILTERS = [
  ["", "All"],
  ["active", "Active"],
  ["unclaimed", "Unregistered"],
  ["claimed", "Registered"],
  ["suspended", "Suspended"],
  ["revoked", "Revoked"],
  ["review", "Review"],
] as const;

export default async function BraceletsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const { q = "", status = "" } = await searchParams;
  const rows = listBracelets({ q, status });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="t-eyebrow">Bracelet database</p>
          <h1 className="t-title mt-2">Bracelets</h1>
        </div>
        <Link href="/admin/nfc/bracelets/new" className="btn-solid">Register a bracelet</Link>
      </div>

      <form className="mt-8 flex flex-col md:flex-row gap-3" role="search">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search bracelet ID, NFC UID, owner or batch"
          aria-label="Search bracelets"
          className="field md:max-w-md"
        />
        {status && <input type="hidden" name="status" value={status} />}
        <button type="submit" className="btn-line">Search</button>
      </form>

      <nav aria-label="Filter by status" className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map(([v, label]) => {
          const on = status === v;
          const href = `/admin/nfc/bracelets?${new URLSearchParams({ ...(q ? { q } : {}), ...(v ? { status: v } : {}) })}`;
          return (
            <Link
              key={label}
              href={href}
              aria-current={on ? "true" : undefined}
              className="px-3 py-1.5 text-[0.8rem] uppercase tracking-[0.14em] border transition-colors"
              style={{ borderColor: on ? "var(--c-ink)" : "var(--c-ink-line)", background: on ? "var(--c-ink)" : "transparent", color: on ? "var(--c-ivory)" : "var(--c-ink)" }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <p className="mt-6 text-[0.9rem] text-[var(--c-ink-muted)]">{rows.length} {rows.length === 1 ? "bracelet" : "bracelets"}</p>

      <div className="mt-3 overflow-x-auto border-t border-[var(--c-ink-line)]">
        <table className="w-full min-w-[860px] text-left text-[0.97rem]">
          <thead>
            <tr className="border-b border-[var(--c-ink-line)] text-[0.68rem] uppercase tracking-[0.14em] text-[var(--c-ink-muted)]">
              <th className="py-3 pr-4 font-medium">Bracelet ID</th>
              <th className="py-3 pr-4 font-medium">NFC UID</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Owner</th>
              <th className="py-3 pr-4 font-medium">Registered</th>
              <th className="py-3 pr-4 font-medium">Last scanned</th>
              <th className="py-3 pr-4 font-medium">Events</th>
              <th className="py-3 font-medium"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => {
              const s = displayStatus(b);
              return (
                <tr key={b.id} className="border-b border-[var(--c-ink-line)] hover:bg-white/50">
                  <td className="py-3.5 pr-4 tabular-nums tracking-[0.05em]">
                    <Link href={`/admin/nfc/bracelets/${b.bracelet_id}`} className="font-medium hover:underline underline-offset-4">{b.bracelet_id}</Link>
                  </td>
                  <td className="py-3.5 pr-4 tabular-nums text-[var(--c-ink-muted)]">{b.nfc_uid ?? "—"}</td>
                  <td className="py-3.5 pr-4">
                    <span className="flex flex-wrap gap-1.5">
                      <Badge tone={statusTone(s)}>{s}</Badge>
                      {b.review_status === "review_recommended" && <Badge tone="warn">Review</Badge>}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">{b.owner_display_name ?? <span className="text-[var(--c-ink-muted)]">—</span>}</td>
                  <td className="py-3.5 pr-4 whitespace-nowrap">{formatDate(b.created_at)}</td>
                  <td className="py-3.5 pr-4 whitespace-nowrap text-[var(--c-ink-muted)]">{formatWhen(b.last_scanned_at)}</td>
                  <td className="py-3.5 pr-4">{b.eligible_events ? `${b.eligible_events} eligible` : <span className="text-[var(--c-ink-muted)]">—</span>}</td>
                  <td className="py-3.5 text-right">
                    <Link href={`/admin/nfc/bracelets/${b.bracelet_id}`} className="btn-text !text-[var(--c-ink)] !text-[12px]">Open</Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-[var(--c-ink-muted)]">
                  No bracelets match. An unknown ID that was scanned appears in Overview → Recent scans as “Not recognized”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
