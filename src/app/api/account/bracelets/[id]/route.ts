import { body, fail, json, sameOrigin } from "@/server/http";
import { currentCustomer } from "@/server/customers";
import { releaseBracelet, setLost, setOwnerVisibility } from "@/server/bracelets";

type Patch = { action: "visibility"; visibility: "initials" | "private" } | { action: "lost" } | { action: "found" } | { action: "release"; confirm: string };

/** The owner's controls for one of their bracelets. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  const c = await currentCustomer();
  if (!c) return json({ error: "Please sign in." }, 401);
  const { id } = await params;
  try {
    const p = await body<Patch>(req);
    switch (p.action) {
      case "visibility":
        setOwnerVisibility(c.id, id, p.visibility);
        return json({ ok: true });
      case "lost":
        setLost(c.id, id, true);
        return json({ ok: true });
      case "found":
        setLost(c.id, id, false);
        return json({ ok: true });
      case "release": {
        if (p.confirm?.trim().toUpperCase() !== decodeURIComponent(id).toUpperCase()) return json({ error: "Type the bracelet ID to confirm." }, 400);
        return json({ transferCode: releaseBracelet(c.id, id) });
      }
    }
    return json({ error: "Unknown action." }, 400);
  } catch (e) {
    return fail(e);
  }
}
