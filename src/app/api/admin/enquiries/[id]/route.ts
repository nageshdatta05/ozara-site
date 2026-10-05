import { isAdmin } from "@/server/session";
import { setEnquiryStatus } from "@/server/messages";
import { body, json, sameOrigin } from "@/server/http";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (!(await isAdmin())) return json({ error: "Unauthorised" }, 401);
  const { id } = await params;
  const b = await body<{ status: "new" | "answered" }>(req).catch(() => ({ status: "answered" as const }));
  setEnquiryStatus(Number(id), b.status === "new" ? "new" : "answered");
  return json({ ok: true });
}
