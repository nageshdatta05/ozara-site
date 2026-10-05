type Props = {
  className?: string;
  rings?: number;
  /** Seconds per ring cycle. Slow is the point. */
  period?: number;
  active?: boolean;
  color?: string;
};

/**
 * The brand's only overt reference to the technology: concentric rings of
 * light expanding from a point, like a ripple across still water.
 */
export function NfcPulse({ className = "", rings = 3, period = 4.8, active = true, color = "var(--c-glint)" }: Props) {
  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <div className="relative size-full">
        {Array.from({ length: rings }).map((_, i) => (
          <span
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border: `1px solid ${color}`,
              opacity: 0,
              animation: active ? `pulse-ring ${period}s var(--ease-lux) ${(i * period) / rings}s infinite` : "none",
            }}
          />
        ))}
        <span
          className="absolute left-1/2 top-1/2 size-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: color, boxShadow: `0 0 18px 4px ${color}`, opacity: active ? 0.9 : 0.3, transition: "opacity 1s" }}
        />
      </div>
    </div>
  );
}
