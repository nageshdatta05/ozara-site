"use client";

import { useRef } from "react";

/**
 * The card, as an object: it rises into place, a sheen crosses it once, and on
 * a mouse it tilts a few degrees toward the pointer. Phones just get the rise
 * and the sheen. Nothing here runs unless the pointer moves, and it all stops
 * for anyone who prefers reduced motion.
 */
export function TiltCard({ className = "", style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (clientX - r.left) / r.width;
      const y = (clientY - r.top) / r.height;
      el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
      el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
    });
  };
  const leave = () => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (!el) return;
    for (const v of ["--rx", "--ry", "--mx", "--my"]) el.style.removeProperty(v);
  };

  return (
    <div ref={ref} className={`id-card ${className}`} style={style} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </div>
  );
}
