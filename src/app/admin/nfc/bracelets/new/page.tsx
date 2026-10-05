import { requireAdmin } from "@/server/session";
import { listEvents } from "@/server/bracelets";
import { publicBase } from "@/server/urls";
import { products } from "@/data/products";
import { RegisterForm } from "@/components/admin/RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  await requireAdmin();
  const events = listEvents().filter((e) => e.status !== "ended").map((e) => ({ id: e.id, name: e.name, status: e.status }));
  return (
    <div className="max-w-3xl">
      <p className="t-eyebrow">Register</p>
      <h1 className="t-title mt-2">Register a bracelet</h1>
      <p className="t-body mt-4 max-w-[60ch]">
        Give the bracelet its permanent ID, record its chip UID, then write the tag URL shown below onto the NFC tag.
      </p>
      <RegisterForm
        base={publicBase()}
        events={events}
        products={products.map((p) => ({ slug: p.slug, name: p.name }))}
      />
    </div>
  );
}
