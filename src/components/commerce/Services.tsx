import { services } from "@/config/site";
import { Slot } from "./Slot";

/** Confirmed service promises. Absent on the live site until configured. */
export function Services({ className = "", columns = 1 }: { className?: string; columns?: 1 | 3 }) {
  if (!services.length)
    return (
      <Slot
        className={className}
        name="Services"
        spec="Delivery, returns, warranty, packaging, engraving, client care — add confirmed promises to `services` in src/config/site.ts."
      />
    );
  return (
    <ul className={`grid gap-5 ${columns === 3 ? "sm:grid-cols-3" : ""} ${className}`}>
      {services.map((s) => (
        <li key={s.title}>
          <p className="t-eyebrow !text-[var(--c-platinum)]">{s.title}</p>
          <p className="mt-1.5 text-[0.95rem] text-muted">{s.body}</p>
        </li>
      ))}
    </ul>
  );
}
