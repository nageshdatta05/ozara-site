"use client";

import { useEffect, useState } from "react";
import { useReducedMotion as useMotionReducedMotion } from "motion/react";

/** True on devices with a fine pointer (mouse / trackpad). */
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

/**
 * Reduced-motion preference that is safe to use during render: it reports
 * `false` until after hydration so server and client markup always match.
 */
export function useReducedMotion() {
  const pref = useMotionReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? !!pref : false;
}

/** Heavy, scroll-pinned choreography only runs on large screens with motion allowed. */
export function useCinematic() {
  const reduce = useReducedMotion();
  const large = useMediaQuery("(min-width: 900px)");
  return { reduce: !!reduce, cinematic: large && !reduce, large };
}
