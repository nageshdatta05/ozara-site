import { body, fail, json, sameOrigin } from "@/server/http";
import { currentCustomer } from "@/server/customers";
import { claimBracelet } from "@/server/bracelets";
import { limited } from "@/server/limits";

/** Register a bracelet to the signed-in customer with its claim code. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  const c = await currentCustomer();
  if (!c) return json({ error: "Please sign in to register a bracelet." }, 401);
  if (await limited("claim", 20, 15 * 60_000)) return json({ error: "Too many attempts. Please try again in a few minutes." }, 429);
  try {
    const b = await body<{ braceletId?: string; code?: string }>(req);
    const r = claimBracelet(c, b.braceletId ?? "", b.code ?? "");
    return json({ braceletId: r.bracelet_id });
  } catch (e) {
    return fail(e);
  }
}
