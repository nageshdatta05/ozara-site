import { organiserSession } from "@/server/session";
import { Verifier } from "@/components/nfc/Verifier";

export const dynamic = "force-dynamic";

/** EVENT VERIFICATION — for door staff. Needs only an event code, never admin. */
export default async function VerifyPage() {
  const s = await organiserSession();
  return <Verifier event={s ? { name: s.event.name } : null} who={s?.who} />;
}
