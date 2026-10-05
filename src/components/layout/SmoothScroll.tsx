"use client";

import Lenis from "lenis";
import { MotionConfig, cancelFrame, frame, type FrameData } from "motion/react";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

type Ctx = {
  scrollTo: (target: string | number) => void;
  lock: (locked: boolean) => void;
};

const SmoothScrollContext = createContext<Ctx>({ scrollTo: () => {}, lock: () => {} });
export const useSmoothScroll = () => useContext(SmoothScrollContext);

/**
 * Weighted, inertial scrolling (Lenis). Native scroll position is preserved,
 * so `useScroll` from Motion keeps working. Disabled for reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    lenisRef.current = lenis;
    // Run inside Motion's frame loop, in its read phase — before any animated
    // style is written this frame — so Lenis's read of the scroll position never
    // forces an extra style and layout pass. (Its own rAF ran after Motion's
    // writes, costing a forced recalc on every scrolling frame.)
    const tick = (data: FrameData) => lenis.raf(data.timestamp);
    frame.read(tick, true);
    return () => {
      cancelFrame(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // New page: start at the top (or at the hash), and re-measure the document.
  const pathname = usePathname();
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.resize();
    const hash = window.location.hash;
    const el = hash ? document.querySelector(hash) : null;
    if (el) lenis.scrollTo(el as HTMLElement, { immediate: true });
    else lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  const scrollTo = useCallback((target: string | number) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target as never, { duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
      return;
    }
    if (typeof target === "number") window.scrollTo({ top: target });
    else document.querySelector(target)?.scrollIntoView();
  }, []);

  const lock = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (locked) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = locked ? "hidden" : "";
  }, []);

  const value = useMemo(() => ({ scrollTo, lock }), [scrollTo, lock]);
  return (
    <SmoothScrollContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SmoothScrollContext.Provider>
  );
}
