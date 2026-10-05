import { adminConfigured, adminLogin, noteAttempt, tooManyAttempts } from "@/server/session";
import { body, json, sameOrigin } from "@/server/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (!adminConfigured()) return json({ error: "Admin access is not configured (set OZARA_ADMIN_PASSWORD)." }, 503);
  if (await tooManyAttempts("admin")) return json({ error: "Too many attempts. Try again in a few minutes." }, 429);
  const { password } = await body<{ password?: string }>(req);
  const ok = !!password && (await adminLogin(password));
  await noteAttempt("admin", ok);
  return ok ? json({ ok: true }) : json({ error: "Incorrect password." }, 401);
}
