import { body, fail, json, sameOrigin } from "@/server/http";
import { joinWaitlist } from "@/server/messages";
import { limited } from "@/server/limits";

/** Join the waiting list. Honeypot field `company` must stay empty (bots fill it). */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  if (await limited("waitlist", 30, 10 * 60_000)) return json({ error: "Too many attempts. Please try again in a few minutes." }, 429);
  try {
    const b = await body<{ email?: string; product?: string; source?: string; company?: string }>(req);
    if (b.company) return json({ status: "joined" }); // quietly ignore bots
    return json({ status: joinWaitlist(b) });
  } catch (e) {
    return fail(e);
  }
}
