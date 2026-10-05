import { isAdmin } from "@/server/session";
import { listWaitlist } from "@/server/messages";

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorised", { status: 401 });
  const esc = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = ["email,product,source,joined", ...listWaitlist().map((w) => [w.email, w.product, w.source, w.created_at].map(esc).join(","))];
  return new Response(rows.join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="ozara-waiting-list.csv"', "Cache-Control": "no-store" },
  });
}
