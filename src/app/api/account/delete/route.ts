import { body, fail, json, sameOrigin } from "@/server/http";
import { currentCustomer, deleteAccount } from "@/server/customers";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  const c = await currentCustomer();
  if (!c) return json({ error: "Please sign in." }, 401);
  try {
    const b = await body<{ password?: string }>(req);
    await deleteAccount(c.id, b.password);
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
