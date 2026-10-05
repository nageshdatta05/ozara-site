"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** The site's endless ambient animations (see globals.css). */
const AMBIENT = ".anim-beams, .anim-breathe, .anim-scroll-cue, .anim-spin-slow";

/**
 * Pauses the endless ambient animations — the light beams, the breathing
 * pieces, the scroll cue — while they are off screen, and resumes them as they
 * come back. Nobody sees the difference; but while any of them runs, the
 * browser restyles the page on every frame, even far down the page.
 */
export function AnimationGate() {
  const pathname = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) (e.target as HTMLElement).style.animationPlayState = e.isIntersecting ? "" : "paused";
      },
      { rootMargin: "120px 0px" }
    );
    const watch = () => document.querySelectorAll(AMBIENT).forEach((el) => io.observe(el));
    watch();
    // pages can mount pieces a moment after the route changes
    const late = window.setTimeout(watch, 400);
    return () => {
      clearTimeout(late);
      io.disconnect();
      document.querySelectorAll<HTMLElement>(AMBIENT).forEach((el) => (el.style.animationPlayState = ""));
    };
  }, [pathname]);
  return null;
}
