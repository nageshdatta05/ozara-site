import { body, fail, json, sameOrigin } from "@/server/http";
import { createEnquiry } from "@/server/messages";
import { limited } from "@/server/limits";
import { inbox, sendEmail } from "@/server/email";
import { site } from "@/config/site";

/** Contact form → saved as an enquiry (admin → Messages) and emailed to the inbox when configured. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Forbidden." }, 403);
  if (await limited("contact", 10, 15 * 60_000)) return json({ error: "Too many messages. Please try again a little later." }, 429);
  try {
    const b = await body<Record<string, unknown>>(req);
    if (b.company) return json({ ok: true }); // honeypot
    const e = createEnquiry(b as never);
    const to = inbox();
    if (to)
      await sendEmail({
        to,
        kind: "enquiry",
        subject: `${site.brand} enquiry — ${e.topic} — ${e.name}`,
        text: `From: ${e.name} <${e.email}>\nTopic: ${e.topic}\n\n${e.message}`,
      });
    await sendEmail({
      to: e.email,
      kind: "enquiry_ack",
      subject: `We've received your message — ${site.brand}`,
      text: `Dear ${e.name},\n\nThank you for writing to ${site.brand}. We've received your message about "${e.topic}" and will reply personally.\n\n— ${site.brand}`,
    });
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
