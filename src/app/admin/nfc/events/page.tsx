import { requireAdmin } from "@/server/session";
import { db } from "@/server/db";
import { listEvents } from "@/server/bracelets";
import { EventsManager } from "@/components/admin/EventsManager";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  await requireAdmin();
  const counts = db()
    .prepare("SELECT event_id, SUM(status='eligible') AS eligible FROM event_eligibility GROUP BY event_id")
    .all() as { event_id: number; eligible: number }[];
  const events = listEvents().map((e) => ({ ...e, eligible: counts.find((c) => c.event_id === e.id)?.eligible ?? 0 }));
  return (
    <div>
      <p className="t-eyebrow">Events</p>
      <h1 className="t-title mt-2">Events & access</h1>
      <p className="t-body mt-4 max-w-[62ch]">
        Each event has its own eligibility list and organiser code. Door staff open <span className="tabular-nums">/verify</span>, enter the code, and can
        only check bracelets for that event. Set eligibility per bracelet on its detail page.
      </p>
      <EventsManager events={events} />
    </div>
  );
}
