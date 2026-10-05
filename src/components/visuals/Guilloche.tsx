"use client";

import { useMemo } from "react";

type Props = {
  className?: string;
  rings?: number;
  petals?: number;
  stroke?: string;
  strokeOpacity?: number;
};

/**
 * Guilloché — the engraved, interlaced rosette of fine watch dials and
 * banknotes. Here it doubles as a field of signal: craft and technology in
 * one drawing. Generated once as static SVG paths.
 */
export function Guilloche({ className = "", rings = 26, petals = 18, stroke = "var(--c-platinum)", strokeOpacity = 0.22 }: Props) {
  const paths = useMemo(() => {
    const out: string[] = [];
    const steps = 360;
    for (let r = 0; r < rings; r++) {
      const base = 60 + r * 13;
      const amp = 4 + (r % 5) * 1.6;
      const phase = r * 0.42;
      let d = "";
      for (let s = 0; s <= steps; s++) {
        const t = (s / steps) * Math.PI * 2;
        const rad = base + amp * Math.sin(petals * t + phase) + amp * 0.4 * Math.sin((petals / 2) * t - phase);
        const x = 500 + rad * Math.cos(t);
        const y = 500 + rad * Math.sin(t);
        d += `${s === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      out.push(d + "Z");
    }
    return out;
  }, [rings, petals]);

  return (
    <svg aria-hidden viewBox="0 0 1000 1000" className={className} fill="none">
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={stroke}
          strokeWidth={0.7}
          strokeOpacity={strokeOpacity * (1 - i / (rings * 1.3))}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
