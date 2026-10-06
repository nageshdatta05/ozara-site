import { requireAdmin } from "@/server/session";
import { allCustomers } from "@/server/customers";
import { formatWhen } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Everyone who has created an account. Read-only. */
export default async function CustomersPage() {
  await requireAdmin();
  const customers = allCustomers();
  return (
    <div>
      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="t-eyebrow !text-[var(--c-ink-muted)]">People</p>
          <h1 className="t-title mt-2">Customer accounts · {customers.length}</h1>
        </div>
        <p className="text-[0.92rem] text-[var(--c-ink-muted)] max-w-[46ch]">
          Everyone who has created an account on the site. Waiting-list sign-ups without an account are under Messages.
        </p>
      </div>
      {customers.length === 0 ? (
        <p className="mt-10 text-[var(--c-ink-muted)]">No accounts yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border-t border-[var(--c-ink-line)]">
          <table className="w-full text-[0.95rem]">
            <thead>
              <tr className="text-left t-eyebrow !text-[var(--c-ink-muted)]">
                {["Name", "Email", "Phone", "Joined", "Bracelets", "Reservations"].map((h) => (
                  <th key={h} className="py-3 pr-6 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-[var(--c-ink-line)]">
                  <td className="py-3.5 pr-6">{c.name}</td>
                  <td className="py-3.5 pr-6">
                    <a href={`mailto:${c.email}`} className="underline underline-offset-2">{c.email}</a>
                  </td>
                  <td className="py-3.5 pr-6 text-[var(--c-ink-muted)]">{c.phone || "—"}</td>
                  <td className="py-3.5 pr-6 whitespace-nowrap text-[var(--c-ink-muted)]">{formatWhen(c.created_at)}</td>
                  <td className="py-3.5 pr-6 tabular-nums">{c.bracelets}</td>
                  <td className="py-3.5 pr-6 tabular-nums">{c.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
