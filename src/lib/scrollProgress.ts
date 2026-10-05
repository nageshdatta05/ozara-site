"use client";

import { frame, useMotionValue, type MotionValue } from "motion/react";
import { useEffect, type RefObject } from "react";

/* ==========================================================================
   Scroll progress for photographs — the same value as Motion's
   useScroll({ target, offset: ["start end", "end start"] }): 0 as the frame's
   top meets the bottom of the viewport, 1 as its bottom leaves the top.

   Motion re-measures every target's position (walking its offset parents) on
   every scroll frame. Here each frame's page position is measured once and
   again only when the page's layout changes (resize, or anything above it
   growing), so a scroll frame is just arithmetic — one listener for them all.
   ========================================================================== */

type Entry = { el: HTMLElement; value: MotionValue<number>; top: number; height: number };
const entries = new Set<Entry>();
let started = false;
let measureQueued = 0;
let readQueued = false;

function pageTop(el: HTMLElement) {
  // the layout position (transforms excluded), as Motion measures it
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

function measure() {
  measureQueued = 0;
  for (const e of entries) {
    e.top = pageTop(e.el);
    e.height = e.el.offsetHeight;
  }
  update();
}

function update() {
  readQueued = false;
  const y = window.scrollY;
  const vh = window.innerHeight;
  for (const e of entries) {
    const p = (y + vh - e.top) / (vh + e.height || 1);
    e.value.set(p < 0 ? 0 : p > 1 ? 1 : p);
  }
}

// Read the scroll position in the read phase of Motion's frame loop — before
// any styles are written that frame — so it never forces a layout, and at
// most once per frame however many scroll events arrive.
function onScroll() {
  if (readQueued) return;
  readQueued = true;
  frame.read(update);
}

function queueMeasure() {
  if (!measureQueued) measureQueued = requestAnimationFrame(measure);
}

function start() {
  if (started) return;
  started = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", queueMeasure);
  // content above a frame changing size (images, fonts, accordions) moves it
  new ResizeObserver(queueMeasure).observe(document.body);
}

export function usePhotoScrollProgress(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const value = useMotionValue(0);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    start();
    const entry: Entry = { el, value, top: 0, height: 0 };
    entries.add(entry);
    queueMeasure();
    return () => {
      entries.delete(entry);
    };
  }, [ref, value, enabled]);
  return value;
}
