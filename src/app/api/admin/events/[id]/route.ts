import { isAdmin } from "@/server/session";
import { updateEvent } from "@/server/bracelets";
import { body, fail, json, sameOrigin } from "@/server/http";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (!(await isAdmin())) return json({ error: "Unauthorised" }, 401);
  const { id } = await params;
  try {
    const b = await body<{ status?: "upcoming" | "live" | "ended"; accessCode?: string }>(req);
    return json(updateEvent(Number(id), b));
  } catch (e) {
    return fail(e);
  }
}
