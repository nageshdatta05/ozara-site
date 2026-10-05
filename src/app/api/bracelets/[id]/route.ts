import { authenticate } from "@/server/verification";
import { deviceClass } from "@/server/session";
import { json } from "@/server/http";

/**
 * PUBLIC LOOKUP — GET /api/bracelets/:id
 * The same decision the /b/:id page shows, as JSON (for the future app).
 * Secure-chip parameters (e.g. ?picc_data=…&cmac=…) are passed through.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proof = Object.fromEntries(new URL(req.url).searchParams);
  const result = authenticate(id, { channel: "public", device: await deviceClass(), proof });
  return json(result);
}
