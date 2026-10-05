import { requireAdmin } from "@/server/session";
import { listEnquiries, listOutbox, listWaitlist } from "@/server/messages";
import { emailConfigured, inbox } from "@/server/email";
import { formatWhen } from "@/lib/format";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { Badge } from "@/components/nfc/Badge";

export const dynamic = "force-dynamic";

/** Contact enquiries, the waiting list and every email the site tried to send. */
export default async function MessagesPage() {
  await requireAdmin();
  const enquiries = listEnquiries();
  const list = listWaitlist();
  const outbox = listOutbox();
  return (
    <div className="space-y-16">
      <div>
        <p className="t-eyebrow !text-[var(--c-ink-muted)]">Customers</p>
        <h1 className="t-title mt-2">Messages</h1>
        <p className="mt-3 text-[0.95rem] text-[var(--c-ink-muted)] max-w-[70ch]">
          Email sending is {emailConfigured() ? <strong>connected</strong> : <strong>not connected</strong>}
          {emailConfigured() ? "" : " — enquiries are saved here but no emails go out until RESEND_API_KEY and EMAIL_FROM are set"}.
          {inbox() ? ` New enquiries are copied to ${inbox()}.` : " Set OZARA_INBOX_EMAIL to receive enquiries by email."}
        </p>
      </div>

      <section>
        <h2 className="t-eyebrow !text-[var(--c-ink)]">Enquiries · {enquiries.length}</h2>
        {enquiries.length === 0 ? (
          <p className="mt-4 text-[var(--c-ink-muted)]">No enquiries yet.</p>
        ) : (
          <ul className="mt-4 border-t border-[var(--c-ink-line)]">
            {enquiries.map((e) => (
              <li key={e.id} className="py-5 border-b border-[var(--c-ink-line)] grid md:grid-cols-[14rem_1fr_auto] gap-4">
                <div className="text-[0.95rem]">
                  <p className="font-medium">{e.name}</p>
                  <a className="underline underline-offset-2" href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.topic}`)}`}>
                    {e.email}
                  </a>
                  <p className="text-[var(--c-ink-muted)] mt-1">{formatWhen(e.created_at)}</p>
                </div>
                <div>
                  <p className="t-eyebrow !text-[12px]">{e.topic}</p>
                  <p className="mt-2 text-[1rem] whitespace-pre-wrap">{e.message}</p>
                </div>
                <StatusSelect url={`/api/admin/enquiries/${e.id}`} value={e.status} options={[["new", "New"], ["answered", "Answered"]]} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="t-eyebrow !text-[var(--c-ink)]">Waiting list · {list.length}</h2>
          {list.length > 0 && (
            <a className="btn-text !text-[var(--c-ink)]" href="/api/admin/waitlist.csv">
              Download CSV
            </a>
          )}
        </div>
        {list.length === 0 ? (
          <p className="mt-4 text-[var(--c-ink-muted)]">Nobody on the list yet.</p>
        ) : (
          <table className="mt-4 w-full text-[0.95rem]">
            <tbody>
              {list.map((w) => (
                <tr key={w.id} className="border-t border-[var(--c-ink-line)]">
                  <td className="py-2.5 pr-6">{w.email}</td>
                  <td className="py-2.5 pr-6 text-[var(--c-ink-muted)]">{w.product ?? "—"}</td>
                  <td className="py-2.5 pr-6 text-[var(--c-ink-muted)]">{w.source ?? "—"}</td>
                  <td className="py-2.5 whitespace-nowrap">{formatWhen(w.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="t-eyebrow !text-[var(--c-ink)]">Email log · last {outbox.length}</h2>
        {outbox.length === 0 ? (
          <p className="mt-4 text-[var(--c-ink-muted)]">No emails attempted yet.</p>
        ) : (
          <table className="mt-4 w-full text-[0.92rem]">
            <tbody>
              {outbox.map((m) => (
                <tr key={m.id} className="border-t border-[var(--c-ink-line)]">
                  <td className="py-2.5 pr-6 whitespace-nowrap">{formatWhen(m.created_at)}</td>
                  <td className="py-2.5 pr-6">{m.to_email}</td>
                  <td className="py-2.5 pr-6">{m.subject}</td>
                  <td className="py-2.5">
                    <Badge tone={m.status === "sent" ? "good" : m.status === "failed" ? "bad" : "neutral"}>{m.status === "not_configured" ? "Not sent — email not connected" : m.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
