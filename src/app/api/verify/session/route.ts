import { organiserLogin, organiserLogout, noteAttempt, tooManyAttempts } from "@/server/session";
import { getEvent } from "@/server/bracelets";
import { body, json, sameOrigin } from "@/server/http";

/** Organiser sign-in with the event code. Grants /verify only — never admin. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (await tooManyAttempts("event")) return json({ error: "Too many attempts. Try again in a few minutes." }, 429);
  const { code, name } = await body<{ code?: string; name?: string }>(req);
  if (!name?.trim()) return json({ error: "Enter your name — every check is recorded against it." }, 400);
  const eventId = code ? await organiserLogin(code, name) : null;
  await noteAttempt("event", !!eventId);
  if (!eventId) return json({ error: "That code isn't valid for a current event." }, 401);
  return json({ event: { id: eventId, name: getEvent(eventId)!.name } });
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  await organiserLogout();
  return json({ ok: true });
}
