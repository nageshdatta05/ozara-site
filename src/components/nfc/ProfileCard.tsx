import type { CardStyle, PublicProfile } from "@/server/profiles";
import { EyeMark, Wordmark } from "@/components/brand/Emblem";
import { MotionPrompt, TiltCard } from "./TiltCard";

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
const host = (u: string) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};

/** The three finishes an owner can choose. Colours only — the shape never changes. */
const FINISH: Record<CardStyle, { bg: string; bgBack: string; ink: string; soft: string; star: string; edge: string }> = {
  midnight: {
    bg: "radial-gradient(120% 90% at 12% 0%, #1b2a78 0%, #0b1450 38%, #00072b 100%)",
    bgBack: "radial-gradient(110% 100% at 92% 100%, #1b2a78 0%, #0b1450 40%, #00072b 100%)",
    ink: "#f6f2ec",
    soft: "rgb(246 242 236 / 0.68)",
    star: "#b9c6ee",
    edge: "rgb(255 255 255 / 0.14)",
  },
  burgundy: {
    bg: "radial-gradient(120% 90% at 12% 0%, #8a1a26 0%, #5a0a12 40%, #3d0103 100%)",
    bgBack: "radial-gradient(110% 100% at 92% 100%, #8a1a26 0%, #5a0a12 40%, #3d0103 100%)",
    ink: "#f8efe9",
    soft: "rgb(248 239 233 / 0.7)",
    star: "#efc9b4",
    edge: "rgb(255 255 255 / 0.14)",
  },
  ivory: {
    bg: "radial-gradient(120% 90% at 12% 0%, #fffdf9 0%, #f3ede2 45%, #ddd3c1 100%)",
    bgBack: "radial-gradient(110% 100% at 92% 100%, #fffdf9 0%, #f3ede2 45%, #ddd3c1 100%)",
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
export function ProfileCard({ p, braceletId, demo = false, photoSrc }: { p: PublicProfile; braceletId: string; demo?: boolean; photoSrc?: string }) {
  const enc = encodeURIComponent(braceletId);
  // on the homepage the same card is shown with made-up details: nothing is a live link
  const A = ({ href, external, className, style, children }: { href: string; external?: boolean; className?: string; style?: React.CSSProperties; children: React.ReactNode }) =>
    demo ? (
      <span className={className} style={style}>
        {children}
      </span>
    ) : (
      <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={className} style={style}>
        {children}
      </a>
    );
  const f = FINISH[p.cardStyle] ?? FINISH.midnight;
  const rows: { icon: keyof typeof ICON; text: string; href: string; external?: boolean }[] = [];
  if (p.phone) rows.push({ icon: "phone", text: p.phone, href: tel(p.phone) });
  if (p.email) rows.push({ icon: "email", text: p.email, href: `mailto:${p.email}` });
  if (p.website) rows.push({ icon: "website", text: host(p.website), href: p.website, external: true });
  if (p.instagram) rows.push({ icon: "instagram", text: `@${p.instagram}`, href: `https://instagram.com/${p.instagram}`, external: true });
  if (p.linkedin) rows.push({ icon: "linkedin", text: "LinkedIn", href: p.linkedin, external: true });
  const canSave = !!(p.name || p.phone || p.email);

  const lines = rows.filter((r) => r.icon === "phone" || r.icon === "email");
  const chips = rows.filter((r) => r.icon !== "phone" && r.icon !== "email");
  const hasBack = rows.length > 0;
  const shadow = `inset 0 0 0 1px ${f.edge}, 0 26px 44px -24px rgb(0 7 43 / 0.6), 0 8px 16px -8px rgb(0 7 43 / 0.35)`;
  const card = (bg: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: bg,
    color: f.ink,
    boxShadow: shadow,
    ["--c-star" as string]: f.star,
    ...extra,
  });
  const cardCls = "w-full flex-1 min-h-[62.5cqw] rounded-[1.1rem] overflow-hidden flex flex-col";
  const wrapCls = "flex flex-col [container-type:inline-size]";

  return (
    <div className="w-full max-w-[24rem] flex flex-col items-center">
      {/* two cards of one size: the grid keeps them level */}
      <div className="w-full grid auto-rows-fr gap-5">
        {/* FRONT — who you are */}
        <div className={wrapCls} style={{ transform: "rotate(-1.1deg)" }}>
          <TiltCard className={cardCls} style={card(f.bg)}>
            <EyeMark className="absolute -right-[12%] -bottom-[30%] w-[72%] opacity-[0.07] pointer-events-none" strokeWidth={0.6} />
            <div className="relative z-[2] flex-1 flex flex-col justify-between gap-4 p-5 sm:p-6 text-left">
              <div className="flex items-center justify-between">
                <Wordmark label={null} className="h-[0.9rem]" />
                <EyeMark className="w-5 opacity-80" strokeWidth={1} />
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  {p.name && <h1 className="font-display text-[1.75rem] sm:text-[2rem] leading-[1.06] break-words">{p.name}</h1>}
                  {p.headline && (
                    <p className="mt-1.5 text-[0.92rem] leading-snug max-w-[24ch]" style={{ color: f.soft }}>
                      {p.headline}
                    </p>
                  )}
                  {p.location && (
                    <p className="mt-2.5 flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.18em]" style={{ color: f.soft }}>
                      <Icon name="pin" />
                      {p.location}
                    </p>
                  )}
                </div>
                {p.photo && (
                  // eslint-disable-next-line @next/next/no-img-element -- a small private photo served by our own route
                  <img
                    src={photoSrc ?? `/b/${enc}/photo`}
                    alt={p.name ? `Photo of ${p.name}` : ""}
                    width={96}
                    height={96}
                    className="size-[4.6rem] sm:size-[5.2rem] rounded-full object-cover shrink-0"
                    style={{ boxShadow: `0 0 0 1px ${f.edge}, 0 0 0 4px ${f.edge}` }}
                  />
                )}
              </div>

              {p.bio && (
                <p
                  className="pt-3 text-[0.9rem] leading-snug"
                  style={{ borderTop: `1px solid ${f.edge}`, color: f.soft, fontFamily: "var(--font-italic)", fontStyle: "italic" }}
                >
                  {p.bio}
                </p>
              )}
            </div>
          </TiltCard>
        </div>

        {/* BACK — how to reach you */}
        {hasBack && (
          <div className={wrapCls} style={{ transform: "rotate(0.9deg)" }}>
            <TiltCard className={cardCls} style={card(f.bgBack, { animationDelay: "0.18s" })}>
              <EyeMark className="absolute -left-[14%] -top-[34%] w-[72%] opacity-[0.07] pointer-events-none" strokeWidth={0.6} />
              <div className="relative z-[2] flex-1 flex flex-col justify-between gap-4 p-5 sm:p-6 text-left">
                <div className="flex items-center justify-between">
                  <EyeMark className="w-5 opacity-80" strokeWidth={1} />
                  <Wordmark label={null} className="h-[0.9rem]" />
                </div>

                <div>
                  {lines.length > 0 && (
                    <ul className="flex flex-col">
                      {lines.map((r, i) => (
                        <li key={r.icon} style={{ borderTop: i === 0 ? `1px solid ${f.edge}` : undefined, borderBottom: `1px solid ${f.edge}` }}>
                          <A href={r.href} className="flex items-center gap-3 py-2.5 text-[0.95rem] transition-opacity hover:opacity-70">
                            <span style={{ color: f.soft }}>
                              <Icon name={r.icon} />
                            </span>
                            <span className="truncate">{r.text}</span>
                          </A>
                        </li>
                      ))}
                    </ul>
                  )}
                  {chips.length > 0 && (
                    <ul className={`flex flex-wrap gap-2 ${lines.length ? "mt-3.5" : ""}`}>
                      {chips.map((r) => (
                        <li key={r.icon}>
                          <A
                            href={r.href}
                            external
                            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.8rem] transition-opacity hover:opacity-70"
                            style={{ boxShadow: `inset 0 0 0 1px ${f.edge}` }}
                          >
                            <span style={{ color: f.soft }}>
                              <Icon name={r.icon} />
                            </span>
                            <span className="truncate max-w-[9rem]">{r.text}</span>
                          </A>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </TiltCard>
          </div>
        )}
      </div>

      {!demo && (
        <>
          <p className="mt-6 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.24em] text-faint">
            <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M3 8.5l3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Authentic OZARA · <span className="tabular-nums">{braceletId}</span>
          </p>

          <MotionPrompt />

          {canSave && (
            <a href={`/b/${enc}/contact`} className="btn-solid mt-8">
              Save contact
            </a>
          )}
        </>
      )}
    </div>
  );
}
