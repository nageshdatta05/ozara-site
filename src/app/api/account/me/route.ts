import { body, fail, json, sameOrigin } from "@/server/http";
import { currentCustomer, updateCustomer } from "@/server/customers";

export async function GET() {
  const c = await currentCustomer();
  return json({ customer: c });
}

export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  const c = await currentCustomer();
  if (!c) return json({ error: "Please sign in." }, 401);
  try {
    const b = await body<{ name?: string; phone?: string; email?: string }>(req);
    return json({ customer: updateCustomer(c.id, b) });
  } catch (e) {
    return fail(e);
  }
}
