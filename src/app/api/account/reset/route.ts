import { body, fail, json, sameOrigin } from "@/server/http";
import { resetPassword } from "@/server/customers";
import { limited } from "@/server/limits";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  if (await limited("reset", 10, 15 * 60_000)) return json({ error: "Too many attempts. Please try again in a few minutes." }, 429);
  try {
    const b = await body<{ token?: string; password?: string }>(req);
    await resetPassword(b.token, b.password);
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
