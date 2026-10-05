import { json, sameOrigin } from "@/server/http";
import { endSession } from "@/server/customers";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  await endSession();
  return json({ ok: true });
}
