import { body, fail, json, sameOrigin } from "@/server/http";
import { currentCustomer } from "@/server/customers";
import { limited } from "@/server/limits";
import { saveProfile } from "@/server/profiles";

/** The owner saves what their bracelet's tap page shows. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  const c = await currentCustomer();
  if (!c) return json({ error: "Please sign in." }, 401);
  if (await limited("profile", 60, 15 * 60_000)) return json({ error: "Too many changes. Please try again in a few minutes." }, 429);
  const { id } = await params;
  try {
    const p = await body<{ published?: unknown; cardStyle?: unknown; values?: Record<string, unknown>; shown?: unknown }>(req);
    saveProfile(c.id, id, p);
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
