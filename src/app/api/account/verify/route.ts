import { body, fail, json, sameOrigin } from "@/server/http";
import { currentCustomer } from "@/server/customers";
import { confirmVerificationCode } from "@/server/verifyEmail";
import { limited } from "@/server/limits";

/** The customer types the 6-digit code from the email. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  const c = await currentCustomer();
  if (!c) return json({ error: "Please sign in." }, 401);
  if (await limited("verify", 30, 15 * 60_000)) return json({ error: "Too many attempts. Please try again in a few minutes." }, 429);
  try {
    const b = await body<{ code?: unknown }>(req);
    confirmVerificationCode(c.id, b.code);
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
