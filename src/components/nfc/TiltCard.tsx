"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The card, as an object: it rises into place, a sheen crosses it once, and it
 * tilts — toward the pointer on a mouse, and with the phone's own movement on
 * a phone. Nothing runs unless something moves, and it all stops for anyone
 * who prefers reduced motion.
 */

const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
const MOTION_EVENT = "ozara-motion";

type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

export function TiltCard({ className = "", style, children }: { className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const set = (rx: number, ry: number, mx: number, my: number) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--mx", `${mx}%`);
    el.style.setProperty("--my", `${my}%`);
  };
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    for (const v of ["--rx", "--ry", "--mx", "--my"]) el.style.removeProperty(v);
  };

  // the phone's movement: hold it a little differently and the card turns with it
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof DeviceOrientationEvent === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    let base: { b: number; g: number } | null = null;
    let target = { rx: 0, ry: 0 };
    let now = { rx: 0, ry: 0 };
    let running = false;
    let live = false;

    const frame = () => {
      // ease toward the target so the card feels weighty, not twitchy
      now.rx += (target.rx - now.rx) * 0.12;
      now.ry += (target.ry - now.ry) * 0.12;
      set(now.rx, now.ry, 50 + now.ry * 4, 50 - now.rx * 4);
      if (Math.abs(target.rx - now.rx) > 0.02 || Math.abs(target.ry - now.ry) > 0.02) raf.current = requestAnimationFrame(frame);
      else running = false;
    };

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!live) {
        live = true;
        el.classList.add("id-card-live");
        window.dispatchEvent(new Event(MOTION_EVENT));
      }
      // the way the phone is held when the page opens is "flat"
      base ??= { b: e.beta, g: e.gamma };
      target = { rx: clamp((base.b - e.beta) * 0.45, 12), ry: clamp((e.gamma - base.g) * 0.45, 14) };
      if (!running) {
        running = true;
        raf.current = requestAnimationFrame(frame);
      }
    };

    window.addEventListener("deviceorientation", onOrient);
    // after the permission is given (iPhone), start listening afresh from a calm baseline
    const regrab = () => (base = null);
    window.addEventListener(MOTION_EVENT + "-granted", regrab);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener(MOTION_EVENT + "-granted", regrab);
      cancelAnimationFrame(raf.current);
      el.classList.remove("id-card-live");
    };
  }, []);

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
      set((0.5 - y) * 8, (x - 0.5) * 10, x * 100, y * 100);
    });
  };
  const leave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    cancelAnimationFrame(raf.current);
    reset();
  };

  return (
    <div ref={ref} className={`id-card ${className}`} style={style} onPointerMove={move} onPointerLeave={leave}>
      {children}
    </div>
  );
}

/**
 * iPhones only let a page read the phone's movement after a tap. This small
 * line appears there (and nowhere else) and goes away once motion is on.
 */
export function MotionPrompt() {
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    if (typeof DeviceOrientationEvent === "undefined") return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const needs = typeof (DeviceOrientationEvent as IOSOrientation).requestPermission === "function";
    if (!needs) return;
    setAsk(true);
    const hide = () => setAsk(false);
    window.addEventListener(MOTION_EVENT, hide); // motion is already flowing
    return () => window.removeEventListener(MOTION_EVENT, hide);
  }, []);

  if (!ask) return null;
  return (
    <button
      type="button"
      className="btn-text mt-6"
      onClick={async () => {
        try {
          const r = await (DeviceOrientationEvent as IOSOrientation).requestPermission!();
          if (r === "granted") window.dispatchEvent(new Event(MOTION_EVENT + "-granted"));
        } catch {
          /* declined or unavailable: the card simply stays still */
        }
        setAsk(false);
      }}
    >
      Tilt your phone to move the card
    </button>
  );
}
