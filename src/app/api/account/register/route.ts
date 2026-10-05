import { body, fail, json, sameOrigin } from "@/server/http";
import { createCustomer, startSession } from "@/server/customers";
import { noteAttempt, tooManyAttempts } from "@/server/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  if (await tooManyAttempts("register")) return json({ error: "Too many attempts. Please try again in a few minutes." }, 429);
  try {
    const b = await body<{ email: string; name: string; password: string; phone?: string }>(req);
    const c = createCustomer(b);
    await startSession({ id: c.id, session_version: 1 });
    return json({ customer: c });
  } catch (e) {
    await noteAttempt("register", false);
    return fail(e);
  }
}
