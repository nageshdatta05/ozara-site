import { adminLogout } from "@/server/session";
import { json, sameOrigin } from "@/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  await adminLogout();
  return json({ ok: true });
}
