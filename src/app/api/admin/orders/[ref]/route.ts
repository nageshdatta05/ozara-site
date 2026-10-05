import { isAdmin } from "@/server/session";
import { setOrderStatus } from "@/server/orders";
import { body, fail, json, sameOrigin } from "@/server/http";

export async function PATCH(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Forbidden" }, 403);
  if (!(await isAdmin())) return json({ error: "Unauthorised" }, 401);
  const { ref } = await params;
  try {
    const b = await body<{ status: string }>(req);
    return json(setOrderStatus(decodeURIComponent(ref), b.status));
  } catch (e) {
    return fail(e);
  }
}
