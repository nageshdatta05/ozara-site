import { findBracelet } from "@/server/bracelets";
import { countHit, overLimit } from "@/server/limits";
import { publicPhoto } from "@/server/profiles";

export const dynamic = "force-dynamic";

/** The owner's photo — only while the bracelet is active and the owner has chosen to show it. */
export async function GET(_req: Request, { params }: { params: Promise<{ braceletId: string }> }) {
  const { braceletId } = await params;
  if (await overLimit("tap-asset", 120, 60_000)) return new Response("Too many requests", { status: 429 });
  await countHit("tap-asset", 60_000);
  const b = findBracelet(braceletId);
  const jpeg = b && b.status === "active" && b.owner_id ? publicPhoto(b.id) : null;
  if (!jpeg) return new Response(null, { status: 404 });
  return new Response(Buffer.from(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
