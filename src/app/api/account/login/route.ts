import { body, fail, json, sameOrigin } from "@/server/http";
import { checkLogin, startSession } from "@/server/customers";
import { noteAttempt, tooManyAttempts } from "@/server/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  if (await tooManyAttempts("customer")) return json({ error: "Too many attempts. Please try again in a few minutes." }, 429);
  try {
    const b = await body<{ email: string; password: string }>(req);
    const row = checkLogin(b.email, b.password);
    await noteAttempt("customer", !!row);
    if (!row) return json({ error: "That email and password don't match an account." }, 401);
    await startSession(row);
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
