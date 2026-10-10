import { findBracelet } from "@/server/bracelets";
import { publicPhoto } from "@/server/profiles";

export const dynamic = "force-dynamic";

/** The owner's photo — only while the bracelet is active and the owner has chosen to show it. */
export async function GET(_req: Request, { params }: { params: Promise<{ braceletId: string }> }) {
  const { braceletId } = await params;
  const b = findBracelet(braceletId);
  const jpeg = b && b.status === "active" && b.owner_id ? publicPhoto(b.id) : null;
  if (!jpeg) return new Response(null, { status: 404 });
  return new Response(Buffer.from(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
