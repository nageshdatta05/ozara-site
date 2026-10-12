import { findBracelet } from "@/server/bracelets";
import { countHit, overLimit } from "@/server/limits";
import { publicProfile, vcard } from "@/server/profiles";

export const dynamic = "force-dynamic";

/** "Save contact": a contact card of exactly what the owner chose to share. */
export async function GET(_req: Request, { params }: { params: Promise<{ braceletId: string }> }) {
  const { braceletId } = await params;
  if (await overLimit("tap-asset", 120, 60_000)) return new Response("Too many requests", { status: 429 });
  await countHit("tap-asset", 60_000);
  const b = findBracelet(braceletId);
  const p = b && b.status === "active" && b.owner_id ? publicProfile(b.id) : null;
  const card = p ? vcard(p) : null;
  if (!card) return new Response(null, { status: 404 });
  return new Response(card, {
    headers: { "Content-Type": "text/vcard; charset=utf-8", "Content-Disposition": 'attachment; filename="contact.vcf"', "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
