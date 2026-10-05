import { organiserSession, deviceClass } from "@/server/session";
import { verifyForEvent } from "@/server/verification";
import { body, json, sameOrigin } from "@/server/http";

/**
 * EVENT CHECK — POST /api/verify { bracelet: "BR-000001" | "https://…/b/BR-000001" }
 * Requires an organiser session. Returns only what the door needs.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  const s = await organiserSession();
  if (!s) return json({ error: "Sign in with your event code first." }, 401);
  const { bracelet } = await body<{ bracelet?: string }>(req);
  const r = verifyForEvent(bracelet ?? "", s.event.id, { channel: "event", device: await deviceClass(), sessionHash: s.sessionHash, verifiedBy: s.who });
  return json(r);
}
