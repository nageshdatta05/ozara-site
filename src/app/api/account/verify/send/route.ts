import { fail, json, sameOrigin } from "@/server/http";
import { currentCustomer } from "@/server/customers";
import { sendVerificationCode } from "@/server/verifyEmail";
import { limited } from "@/server/limits";

/** Email a new code (limited to one a minute per account). */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  const c = await currentCustomer();
  if (!c) return json({ error: "Please sign in." }, 401);
  if (await limited("verify-send", 12, 60 * 60_000)) return json({ error: "Too many requests. Please try again later." }, 429);
  try {
    return json({ ok: true, ...(await sendVerificationCode(c.id)) });
  } catch (e) {
    return fail(e);
  }
}
