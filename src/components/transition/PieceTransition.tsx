"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { productHref, type Product } from "@/data/products";
import { PLATE_SIZES, stageBox } from "@/lib/stage";
import { ease } from "@/lib/motion";

/* ==========================================================================
   THE PIECE TRANSITION — choosing a bracelet "opens the eye".
   An almond aperture opens from the bracelet's eye, flooding the screen with
   its stage; the bracelet travels to the centre; the piece's page loads
   underneath in exactly the same composition and the veil lifts.
   ========================================================================== */

type Origin = { rect?: DOMRect; point?: { x: number; y: number } };
type Run = { product: Product; origin: Origin; phase: "cover" | "reveal"; key: number };

const Ctx = createContext<{ present: (p: Product, origin?: Origin) => void; arrived: (slug: string) => void }>({
  present: () => {},
  arrived: () => {},
});
export const usePieceTransition = () => useContext(Ctx);

const COVER_MS = 1050;

export function PieceTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [run, setRun] = useState<Run | null>(null);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const present = useCallback(
    (p: Product, origin: Origin = {}) => {
      const href = productHref(p);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || pathname === href) {
        router.push(href);
        return;
      }
      clear();
      router.prefetch(href);
      setRun({ product: p, origin, phase: "cover", key: Date.now() });
      timers.current.push(window.setTimeout(() => router.push(href), COVER_MS));
      // never leave the veil up if the page is slow
      timers.current.push(window.setTimeout(() => setRun((r) => (r ? { ...r, phase: "reveal" } : r)), COVER_MS + 3500));
    },
    [pathname, router]
  );

  const arrived = useCallback((slug: string) => {
    setRun((r) => (r && r.product.slug === slug && r.phase === "cover" ? { ...r, phase: "reveal" } : r));
  }, []);

  // when the veil has lifted, remove it
  useEffect(() => {
    if (run?.phase !== "reveal") return;
    const t = window.setTimeout(() => setRun(null), 900);
    return () => clearTimeout(t);
  }, [run?.phase]);

  useEffect(() => clear, []);

  const value = useMemo(() => ({ present, arrived }), [present, arrived]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {run && <Veil run={run} />}
    </Ctx.Provider>
  );
}

function Veil({ run }: { run: Run }) {
  const { product: p, origin, phase } = run;
  const [vp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const box = stageBox(vp.w, vp.h);
  const from = origin.rect;
  const eye = from
    ? { x: from.left + (from.width * p.media.plate.eye.x) / 100, y: from.top + (from.height * p.media.plate.eye.y) / 100 }
    : origin.point ?? { x: vp.w / 2, y: vp.h / 2 };
  const R = Math.hypot(Math.max(eye.x, vp.w - eye.x), Math.max(eye.y, vp.h - eye.y)) * 1.15;

  return (
    <motion.div
      aria-hidden
      className="fixed inset-0 z-[90] pointer-events-auto"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "reveal" ? 0 : 1 }}
      transition={{ duration: 0.8, ease: ease.silk }}
    >
      {/* the eye opens: a thin lid first, then the whole stage */}
      <motion.div
        className="absolute inset-0 stage grain"
        initial={{ clipPath: `ellipse(${R * 0.12}px 0px at ${eye.x}px ${eye.y}px)` }}
        animate={{
          clipPath: [
            `ellipse(${R * 0.12}px 0px at ${eye.x}px ${eye.y}px)`,
            `ellipse(${R * 0.42}px ${R * 0.07}px at ${eye.x}px ${eye.y}px)`,
            `ellipse(${R}px ${R}px at ${eye.x}px ${eye.y}px)`,
          ],
        }}
        transition={{ duration: 1, times: [0, 0.38, 1], ease: ease.silk }}
      >
        <div className="absolute inset-0" style={{ background: `radial-gradient(55% 50% at 50% 52%, ${p.tone.wash}, transparent 75%)` }} />
      </motion.div>

      {/* the piece travels to the centre */}
      <motion.div
        className="absolute"
        style={{ left: box.left, top: box.top, width: box.width, height: box.height, transformOrigin: "0 0" }}
        initial={
          from
            ? { x: from.left - box.left, y: from.top - box.top, scale: from.width / box.width, opacity: 1 }
            : { x: 0, y: 12, scale: 0.94, opacity: 0 }
        }
        animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 1.05, ease: ease.lux, delay: from ? 0.08 : 0.35 }}
      >
        <Image src={p.media.plate.src} alt="" fill sizes={PLATE_SIZES} quality={90} priority className="object-contain" />
      </motion.div>
    </motion.div>
  );
}
