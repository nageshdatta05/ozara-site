import { isAdmin } from "@/server/session";
import { assignOwner, clearReview, findBracelet, resetClaimCode, setEligibility, setStatus, updateBracelet } from "@/server/bracelets";
import { body, fail, json, sameOrigin } from "@/server/http";

type Patch =
  | { action: "update"; nfcUid?: string; productSlug?: string; batch?: string; notes?: string }
  | { action: "revoke"; reason?: string; confirm: string }
  | { action: "restore" }
  | { action: "eligibility"; eventId: number; status: "eligible" | "not_eligible" | null }
  | { action: "owner"; owner: { displayName: string; publicLabel?: string; email?: string } | null }
  | { action: "clearReview" }
  | { action: "claimCode" };

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (!(await isAdmin())) return json({ error: "Unauthorised" }, 401);
  const { id } = await params;
  try {
    const p = await body<Patch>(req);
    switch (p.action) {
      case "update":
        return json(updateBracelet(id, p));
      case "revoke": {
        // destructive: the client must echo the bracelet ID back
        const b = findBracelet(id);
        if (!b || p.confirm?.trim().toUpperCase() !== b.bracelet_id) return json({ error: "Type the bracelet ID to confirm." }, 400);
        return json(setStatus(id, "revoked", p.reason));
      }
      case "restore":
        return json(setStatus(id, "active"));
      case "eligibility":
        setEligibility(id, Number(p.eventId), p.status);
        return json(findBracelet(id));
      case "owner":
        assignOwner(id, p.owner);
        return json(findBracelet(id));
      case "clearReview":
        clearReview(id);
        return json(findBracelet(id));
      case "claimCode":
        return json({ claimCode: resetClaimCode(id) });
    }
    return json({ error: "Unknown action." }, 400);
  } catch (e) {
    return fail(e);
  }
}
