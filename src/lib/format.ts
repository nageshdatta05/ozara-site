const TZ = process.env.OZARA_TIMEZONE || undefined;

export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const day = (x: Date) => x.toLocaleDateString("en-GB", { timeZone: TZ });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
  if (day(d) === day(now)) return `Today, ${time}`;
  const y = new Date(now.getTime() - 864e5);
  if (day(d) === day(y)) return `Yesterday, ${time}`;
  return `${d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ })}, ${time}`;
}

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: TZ }) : "—";

export const formatMonth = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: TZ }) : "";
