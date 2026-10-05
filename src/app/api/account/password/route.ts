import { body, fail, json, sameOrigin } from "@/server/http";
import { changePassword, currentCustomer } from "@/server/customers";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  const c = await currentCustomer();
  if (!c) return json({ error: "Please sign in." }, 401);
  try {
    const b = await body<{ current: string; next: string }>(req);
    await changePassword(c.id, b.current, b.next);
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
