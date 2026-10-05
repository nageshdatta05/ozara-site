/**
 * The OZARA emblem — a ring quartered by fine lines, a four-pointed star
 * drawn in concave arcs, and a diamond set at its centre. Traced from the brand
 * logo so it stays crisp at every size. Colour follows `currentColor`.
 */
export function Emblem({
  className = "",
  title,
  strokeWidth = 1.6,
}: {
  className?: string;
  title?: string;
  strokeWidth?: number;
}) {
  // geometry in a 100×100 box, centre (50,50)
  const R = 46; // ring
  const tv = 29; // vertical star tips
  const th = 25; // horizontal star tips
  const k = 3.2; // how far the concave arcs pull toward the centre
  const star = `M50 ${50 - tv} Q${50 + k} ${50 - k} ${50 + th} 50 Q${50 + k} ${50 + k} 50 ${50 + tv} Q${50 - k} ${50 + k} ${50 - th} 50 Q${50 - k} ${50 - k} 50 ${50 - tv} Z`;
  return (
    <svg viewBox="0 0 100 100" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} fill="none">
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" vectorEffect="non-scaling-stroke">
        <circle cx="50" cy="50" r={R} />
        <line x1="50" y1={50 - R} x2="50" y2={50 + R} />
        <line x1={50 - R} y1="50" x2={50 + R} y2="50" />
        <path d={star} />
      </g>
      {/* the centre stone — the diamond from the stone selection, in a fine bezel */}
      <circle cx="50" cy="50" r="6.4" stroke="currentColor" strokeWidth={strokeWidth * 0.75} vectorEffect="non-scaling-stroke" opacity="0.7" />
      <image href="/media/gems/diamond.png" x={50 - 5.4} y={50 - 5.4} width="10.8" height="10.8" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}

/** Emblem + wordmark lock-up. */
export function Logo({ className = "", stacked = false }: { className?: string; stacked?: boolean }) {
  return (
    <span className={`inline-flex items-center ${stacked ? "flex-col gap-3" : "gap-3"} ${className}`}>
      <Emblem className={stacked ? "size-14" : "size-[1.55em]"} strokeWidth={stacked ? 1.2 : 1.4} />
      <span className="wordmark">OZARA</span>
    </span>
  );
}

/** The four-pointed star of the emblem, as a path centred on (cx, cy). */
export function starPath(cx: number, cy: number, tv: number, th: number, k = tv * 0.11) {
  return `M${cx} ${cy - tv} Q${cx + k} ${cy - k} ${cx + th} ${cy} Q${cx + k} ${cy + k} ${cx} ${cy + tv} Q${cx - k} ${cy + k} ${cx - th} ${cy} Q${cx - k} ${cy - k} ${cx} ${cy - tv} Z`;
}

/** The almond of the eye in a 100 × 56 box. `open` 0 → a closed lid, 1 → fully open. */
export function almondPath(open = 1) {
  const h = 26 * open;
  return `M2 28 C 26 ${28 - h}, 74 ${28 - h}, 98 28 C 74 ${28 + h}, 26 ${28 + h}, 2 28 Z`;
}

/**
 * The OZARA eye — the emblem's star set in an almond, as it sits on every
 * bracelet. Used sparingly: as a cursor, a marker, a quiet signature.
 */
export function EyeMark({
  className = "",
  open = 1,
  strokeWidth = 1.2,
  filled = false,
}: {
  className?: string;
  open?: number;
  strokeWidth?: number;
  filled?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 56" className={className} aria-hidden fill="none">
      <path d={almondPath(open)} stroke="currentColor" strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.08 : 0} />
      <path d={starPath(50, 28, 15 * Math.max(open, 0.001), 12 * Math.max(open, 0.001))} fill="currentColor" opacity={Math.min(1, open * 1.4)} />
    </svg>
  );
}

/**
 * The OZARA logotype — the brand lettering itself, cut from the logo artwork
 * (public/brand). The letters follow `currentColor`; the star in the O takes
 * `--c-star` (burgundy on light rooms, rose on dark), as in the logo.
 * Size it by height, e.g. className="h-5".
 */
export function Wordmark({ className = "", label = "OZARA" }: { className?: string; label?: string | null }) {
  const mask = (src: string): React.CSSProperties => ({
    WebkitMask: `url(${src}) center / contain no-repeat`,
    mask: `url(${src}) center / contain no-repeat`,
  });
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      className={`relative inline-block align-middle shrink-0 aspect-[1400/329] ${className}`}
    >
      <span className="absolute inset-0 bg-current" style={mask("/brand/ozara-wordmark.png")} />
      <span className="absolute inset-0" style={{ ...mask("/brand/ozara-wordmark-star.png"), background: "var(--c-star, var(--c-burgundy))" }} />
    </span>
  );
}
