import { isAdmin } from "@/server/session";
import { createBracelet, listBracelets } from "@/server/bracelets";
import { body, fail, json, sameOrigin } from "@/server/http";

export async function GET(req: Request) {
  if (!(await isAdmin())) return json({ error: "Unauthorised" }, 401);
  const u = new URL(req.url);
  return json(listBracelets({ q: u.searchParams.get("q") ?? undefined, status: u.searchParams.get("status") ?? undefined }));
}

/** Register a bracelet. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (!(await isAdmin())) return json({ error: "Unauthorised" }, 401);
  try {
    const b = await body<{
      braceletId: string;
      nfcUid?: string;
      productSlug?: string;
      batch?: string;
      status?: "active" | "revoked";
      notes?: string;
      eligibleEventIds?: number[];
    }>(req);
    return json(createBracelet(b), 201);
  } catch (e) {
    return fail(e);
  }
}
