import { isAdmin } from "@/server/session";
import { createEvent, listEvents } from "@/server/bracelets";
import { body, fail, json, sameOrigin } from "@/server/http";

export async function GET() {
  if (!(await isAdmin())) return json({ error: "Unauthorised" }, 401);
  return json(listEvents());
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (!(await isAdmin())) return json({ error: "Unauthorised" }, 401);
  try {
    const b = await body<{ name: string; startsAt?: string; venue?: string; status?: "upcoming" | "live" | "ended"; accessCode?: string }>(req);
    return json(createEvent(b), 201);
  } catch (e) {
    return fail(e);
  }
}
