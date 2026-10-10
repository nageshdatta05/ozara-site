import { fail, json, sameOrigin } from "@/server/http";
import { currentCustomer } from "@/server/customers";
import { limited } from "@/server/limits";
import { deletePhoto, MAX_PHOTO_BYTES, savePhoto } from "@/server/profiles";
import { InputError } from "@/server/bracelets";

/** The owner's photo — already cropped and compressed to a small JPEG by their browser. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  const c = await currentCustomer();
  if (!c) return json({ error: "Please sign in." }, 401);
  if (await limited("photo", 20, 15 * 60_000)) return json({ error: "Too many changes. Please try again in a few minutes." }, 429);
  const { id } = await params;
  try {
    if (Number(req.headers.get("content-length") ?? 0) > MAX_PHOTO_BYTES) throw new InputError("That photo is too large. Try a smaller one.");
    savePhoto(c.id, id, new Uint8Array(await req.arrayBuffer()));
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  const c = await currentCustomer();
  if (!c) return json({ error: "Please sign in." }, 401);
  const { id } = await params;
  try {
    deletePhoto(c.id, id);
    return json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
