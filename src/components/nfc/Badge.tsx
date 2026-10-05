const TONES = {
  good: "bg-[#e3efe7] text-[#1d5b3a]",
  neutral: "bg-[#e7e9ee] text-[#2c3547]",
  info: "bg-[#e3e9f6] text-[#243d74]",
  warn: "bg-[#f4ead6] text-[#7a5410]",
  bad: "bg-[#f3e1e3] text-[#8a2130]",
} as const;

export type Tone = keyof typeof TONES;

/** Quiet status pill for the admin. */
export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.78rem] font-medium tracking-[0.06em] uppercase rounded-[3px] ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export const statusTone = (s: string): Tone =>
  s === "Registered" ? "info" : s === "Unregistered" ? "neutral" : s === "Suspended" ? "warn" : s === "Revoked" ? "bad" : "neutral";

export const resultBadge = (r: string) =>
  r === "authentic" ? (
    <Badge tone="good">Authenticated</Badge>
  ) : r === "revoked" ? (
    <Badge tone="bad">Revoked</Badge>
  ) : r === "suspended" ? (
    <Badge tone="warn">Suspended</Badge>
  ) : (
    <Badge tone="warn">Not recognized</Badge>
  );
