import { body, json, sameOrigin } from "@/server/http";
import { createPasswordReset } from "@/server/customers";
import { limited } from "@/server/limits";
import { sendEmail } from "@/server/email";
import { publicBase } from "@/server/urls";
import { site } from "@/config/site";

/** Always the same answer, whether or not the email has an account. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  if (await limited("forgot", 5, 15 * 60_000)) return json({ error: "Too many attempts. Please try again in a few minutes." }, 429);
  const b = await body<{ email?: string }>(req).catch(() => ({ email: "" }));
  const r = createPasswordReset(b.email);
  if (r) {
    const link = `${publicBase()}/account/reset?token=${r.token}`;
    await sendEmail({
      to: r.customer.email,
      kind: "password_reset",
      sensitive: true,
      subject: `Reset your ${site.brand} password`,
      text: `Dear ${r.customer.name},\n\nUse this link within the next hour to choose a new password:\n${link}\n\nIf you didn't ask for this, you can ignore this email — your password hasn't changed.\n\n— ${site.brand}`,
    });
  }
  return json({ ok: true });
}
