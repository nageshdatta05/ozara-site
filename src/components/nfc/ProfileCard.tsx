import type { CardStyle, PublicProfile } from "@/server/profiles";
import { EyeMark, Wordmark } from "@/components/brand/Emblem";
import { TiltCard } from "./TiltCard";

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

/** The three finishes an owner can choose. Colours only — the shape never changes. */
const FINISH: Record<CardStyle, { bg: string; ink: string; soft: string; star: string; edge: string }> = {
  midnight: {
    bg: "radial-gradient(120% 80% at 18% 0%, #1b2a78 0%, #0b1450 38%, #00072b 100%)",
    ink: "#f6f2ec",
    soft: "rgb(246 242 236 / 0.68)",
    star: "#b9c6ee",
    edge: "rgb(255 255 255 / 0.14)",
  },
  burgundy: {
    bg: "radial-gradient(120% 80% at 18% 0%, #8a1a26 0%, #5a0a12 40%, #3d0103 100%)",
    ink: "#f8efe9",
    soft: "rgb(248 239 233 / 0.7)",
    star: "#efc9b4",
    edge: "rgb(255 255 255 / 0.14)",
  },
  ivory: {
    bg: "radial-gradient(120% 80% at 18% 0%, #fffdf9 0%, #f3ede2 45%, #ddd3c1 100%)",
    ink: "#00072b",
    soft: "rgb(0 7 43 / 0.62)",
    star: "#3d0103",
    edge: "rgb(0 7 43 / 0.12)",
  },
};

const ICON: Record<string, React.ReactNode> = {
  phone: <path d="M5 3h3l1.5 4-2 1.3a10 10 0 0 0 4.2 4.2L13 10.5l4 1.5v3a2 2 0 0 1-2 2A12 12 0 0 1 3 5a2 2 0 0 1 2-2Z" />,
  email: <path d="M3 5.5h14v9H3zM3.5 6l6.5 5 6.5-5" />,
  website: <path d="M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM3 10h14M10 3c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7Z" />,
  instagram: <path d="M6 3h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Zm4 4.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Zm4.2-1.4h.01" />,
  linkedin: <path d="M4.5 8v7.5M4.5 4.8v.01M8.5 15.5V8m0 3.2c0-1.8 1.2-3.2 3-3.2s2.5 1.2 2.5 3.2v4.3" />,
  pin: <path d="M10 17s5-4.6 5-8.5a5 5 0 0 0-10 0C5 12.400 10 17 10 17Zm0-6.2a1.8 1.8 0 1 0 0-3.600 1.8 1.8 0 0 0 0 3.600Z" />,
};

function Icon({ name }: { name: keyof typeof ICON }) {
  return (
    <svg viewBox="0 0 20 20" className="size-[1.05rem] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICON[name]}
    </svg>
  );
}

/**
 * What an owner chose to share, shown after a tap — as a card. Everything on
 * it comes from the owner's own page; nothing is filled in for them.
 */
export function ProfileCard({ p, braceletId }: { p: PublicProfile; braceletId: string }) {
  const enc = encodeURIComponent(braceletId);
  const f = FINISH[p.cardStyle] ?? FINISH.midnight;
  const rows: { icon: keyof typeof ICON; text: string; href: string; external?: boolean }[] = [];
  if (p.phone) rows.push({ icon: "phone", text: p.phone, href: tel(p.phone) });
  if (p.email) rows.push({ icon: "email", text: p.email, href: `mailto:${p.email}` });
  if (p.website) rows.push({ icon: "website", text: host(p.website), href: p.website, external: true });
  if (p.instagram) rows.push({ icon: "instagram", text: `@${p.instagram}`, href: `https://instagram.com/${p.instagram}`, external: true });
  if (p.linkedin) rows.push({ icon: "linkedin", text: "LinkedIn", href: p.linkedin, external: true });
  const canSave = !!(p.name || p.phone || p.email);

  return (
    <div className="w-full max-w-[21rem] flex flex-col items-center">
      <TiltCard
        className="w-full min-h-[34rem] rounded-[1.7rem] overflow-hidden"
        style={{
          background: f.bg,
          color: f.ink,
          boxShadow: `inset 0 0 0 1px ${f.edge}, 0 1px 0 ${f.edge} inset, 0 28px 50px -22px rgb(0 7 43 / 0.55), 0 8px 18px -8px rgb(0 7 43 / 0.35)`,
          ["--c-star" as string]: f.star,
        }}
      >
        {/* the Eye, large and faint, as a watermark */}
        <EyeMark className="absolute -right-[22%] -bottom-[6%] w-[105%] opacity-[0.07] pointer-events-none" strokeWidth={0.6} />

        <div className="relative z-[2] min-h-[34rem] flex flex-col gap-7 p-7 text-left">
          <div className="flex items-center justify-between">
            <Wordmark label={null} className="h-[1.05rem]" />
            <EyeMark className="w-6 opacity-80" strokeWidth={1} />
          </div>

          <div className="flex flex-col items-start my-auto">
            {p.photo && (
              // eslint-disable-next-line @next/next/no-img-element -- a small private photo served by our own route
              <img
                src={`/b/${enc}/photo`}
                alt={p.name ? `Photo of ${p.name}` : ""}
                width={120}
                height={120}
                className="size-[6rem] rounded-full object-cover mb-5"
                style={{ boxShadow: `0 0 0 1px ${f.edge}, 0 0 0 5px ${f.edge}` }}
              />
            )}
            {p.name && <h1 className="font-display text-[2.1rem] leading-[1.06] break-words max-w-full">{p.name}</h1>}
            {p.headline && (
              <p className="mt-2 text-[1rem] leading-snug max-w-[26ch]" style={{ color: f.soft }}>
                {p.headline}
              </p>
            )}
            {p.location && (
              <p className="mt-3 flex items-center gap-1.5 text-[0.82rem] uppercase tracking-[0.16em]" style={{ color: f.soft }}>
                <Icon name="pin" />
                {p.location}
              </p>
            )}
            {p.bio && (
              <p className="mt-4 text-[0.95rem] leading-relaxed max-w-[30ch]" style={{ color: f.soft }}>
                {p.bio}
              </p>
            )}
          </div>

          {rows.length > 0 && (
            <ul className="flex flex-col" style={{ borderTop: `1px solid ${f.edge}` }}>
              {rows.map((r) => (
                <li key={r.icon} style={{ borderBottom: `1px solid ${f.edge}` }}>
                  <a
                    href={r.href}
                    {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-center gap-3.5 py-3 text-[0.98rem] transition-opacity hover:opacity-70"
                  >
                    <span style={{ color: f.soft }}>
                      <Icon name={r.icon} />
                    </span>
                    <span className="truncate">{r.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-end justify-between gap-4">
            <p className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.24em]" style={{ color: f.soft }}>
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                <path d="M3 8.5l3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Authentic
            </p>
            <p className="text-[0.72rem] tabular-nums tracking-[0.2em]" style={{ color: f.soft }}>
              {braceletId}
            </p>
          </div>
        </div>
      </TiltCard>

      {canSave && (
        <a href={`/b/${enc}/contact`} className="btn-solid mt-9">
          Save contact
        </a>
      )}
    </div>
  );
}
