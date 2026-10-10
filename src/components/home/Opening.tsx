"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { products, productHref, type Product } from "@/data/products";
import { copy } from "@/content/copy";
import { EyeMark, almondPath } from "@/components/brand/Emblem";
import { usePieceTransition } from "@/components/transition/PieceTransition";
import { useFinePointer, useReducedMotion } from "@/lib/hooks";
import { PLATE_SIZES } from "@/lib/stage";
import { ease } from "@/lib/motion";
import { useSmoothScroll } from "@/components/layout/SmoothScroll";

/* ==========================================================================
   THE OPENING — three objects on a travertine stage.
   Not three product cards: three pieces in a quiet exhibition. The eye opens
   on the room; the pointer becomes an eye that opens over a piece; choosing
   one carries you into it. On phones the pieces are a swipeable rail.
   ========================================================================== */

/** Desktop composition: each piece has its own scale and height on the stone. */
const LAYOUT = [
  { w: "min(31vw, 560px)", y: "3vh", depth: 1 },
  { w: "min(34vw, 620px)", y: "-2.5vh", depth: 1.4 },
  { w: "min(30vw, 540px)", y: "4.5vh", depth: 0.8 },
];

export function Opening() {
  const c = copy.opening;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const fine = useFinePointer();
  const { present } = usePieceTransition();
  const { scrollTo } = useSmoothScroll();
  const [focus, setFocus] = useState<number | null>(null);
  const [leaving, setLeaving] = useState<number | null>(null);

  // the room responds, a little, to the pointer
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 40, damping: 18, mass: 1 };
  const sx = useSpring(mx, spring);
  const sy = useSpring(my, spring);
  const beamX = useTransform(sx, (v) => v * -40);
  const beamY = useTransform(sy, (v) => v * -24);

  // the eye cursor
  const cx = useMotionValue(-200);
  const cy = useMotionValue(-200);
  const csx = useSpring(cx, { stiffness: 420, damping: 38 });
  const csy = useSpring(cy, { stiffness: 420, damping: 38 });
  const [inside, setInside] = useState(false);

  // as you scroll away, the pieces linger and the words leave first
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const piecesY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const wordsOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const wordsY = useTransform(scrollYProgress, [0, 0.35], ["0%", "-30%"]);

  const live = fine && !reduce;

  const choose = (p: Product, i: number, el: HTMLElement | null) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setLeaving(i);
    const img = el?.querySelector("img");
    present(p, { rect: img?.getBoundingClientRect() });
  };

  return (
    <section
      ref={ref}
      aria-label={c.label}
      data-theme="light"
      className={`relative h-[100svh] min-h-[600px] overflow-hidden bg-paper ${live ? "cursor-none [&_a]:cursor-none" : ""}`}
      onPointerMove={(e) => {
        if (!live || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
        cx.set(e.clientX - r.left);
        cy.set(e.clientY - r.top);
      }}
      onPointerEnter={() => setInside(true)}
      onPointerLeave={() => {
        setInside(false);
        setFocus(null);
      }}
    >
      {/* The eye opens on the room. */}
      {/* CSS, not JS: it plays the moment the page paints, before hydration */}
      <div className="absolute inset-0 stage grain eye-open">
        <motion.div aria-hidden className="absolute -inset-[12%] light-beams anim-beams" style={{ x: beamX, y: beamY }} />
        {/* the room takes on the tone of the piece in focus */}
        {products.map((p, i) => (
          <div
            key={p.id}
            aria-hidden
            className="absolute inset-0 transition-opacity duration-[1400ms] ease-[var(--ease-lux)]"
            style={{
              opacity: focus === i ? 1 : 0,
              background: `radial-gradient(38% 44% at ${[24, 50, 76][i]}% 48%, ${p.tone.wash}, transparent 72%)`,
            }}
          />
        ))}

        {/* ---- Desktop & tablet: the three pieces on the stone ---- */}
        <motion.ul
          className="hidden md:flex absolute inset-x-0 top-[9%] bottom-[31%] items-center justify-center"
          style={{ y: piecesY }}
        >
          {products.map((p, i) => (
            <Piece
              key={p.id}
              product={p}
              index={i}
              focus={focus}
              leaving={leaving}
              live={live}
              reduce={reduce}
              sx={sx}
              sy={sy}
              onFocus={() => setFocus(i)}
              onBlur={() => setFocus((f) => (f === i ? null : f))}
              onChoose={choose}
            />
          ))}
        </motion.ul>

        {/* ---- Phones: one piece at a time ---- */}
        <MobileRail onChoose={choose} reduce={reduce} />

        {/* ---- Words ---- */}
        <motion.div
          className="absolute inset-x-0 bottom-[7svh] md:bottom-[10svh] flex flex-col items-center text-center px-6 pointer-events-none"
          style={{ opacity: wordsOpacity, y: wordsY }}
        >
          <p className="t-eyebrow fade-in" style={{ animationDelay: "1.7s" }}>
            {c.eyebrow}
          </p>
          <h1 className="t-display mt-3 md:mt-4 !text-[clamp(2rem,3.7vw,4rem)]" aria-label={c.headline.join(" ")}>
            {c.headline.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em]">
                <span className="block line-rise" style={{ animationDelay: `${1.55 + i * 0.12}s` }}>
                  {i === 1 ? <em>{line}</em> : line}
                </span>
              </span>
            ))}
          </h1>
          <p className="t-body !text-[0.98rem] md:!text-[1rem] leading-snug mt-3 md:mt-5 max-w-[32ch] md:max-w-[46ch] fade-in" style={{ animationDelay: "1.9s" }}>
            {c.sub}
          </p>
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("#how-it-works");
            }}
            className="btn-text mt-4 pointer-events-auto fade-in"
            style={{ animationDelay: "2s" }}
          >
            {c.how}
          </a>
        </motion.div>

        {/* hint: choose / scroll */}
        <div className="hidden md:flex absolute inset-x-0 bottom-[6.5svh] shell justify-between items-end pointer-events-none fade-in" style={{ animationDelay: "2.2s" }}>
          <p className="t-eyebrow flex items-center gap-3">
            <EyeMark className="w-6 text-[var(--c-strong)]" />
            {c.choose}
          </p>
          <p className="t-eyebrow flex items-center gap-4">
            {c.scroll}
            <span aria-hidden className="relative block h-10 w-px bg-[var(--c-line)] overflow-hidden">
              <span className="absolute inset-0 bg-[var(--c-strong)] anim-scroll-cue" />
            </span>
          </p>
        </div>
      </div>

      {/* The eye cursor: a closed lid that opens over a piece. */}
      {live && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-30"
          style={{ x: csx, y: csy }}
          animate={{ opacity: inside && leaving === null ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <EyeCursor open={focus !== null} label={copy.opening.explore} />
        </motion.div>
      )}
    </section>
  );
}

/* ---- One piece on the stone -------------------------------------------- */

type PieceProps = {
  product: Product;
  index: number;
  focus: number | null;
  leaving: number | null;
  live: boolean;
  reduce: boolean;
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
  onFocus: () => void;
  onBlur: () => void;
  onChoose: (p: Product, i: number, el: HTMLElement | null) => (e: React.MouseEvent) => void;
};

function Piece({ product: p, index: i, focus, leaving, live, reduce, sx, sy, onFocus, onBlur, onChoose }: PieceProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const L = LAYOUT[i];
  const px = useTransform(sx, (v) => v * 18 * L.depth);
  const py = useTransform(sy, (v) => v * 12 * L.depth);
  const focused = focus === i;
  const dimmed = (focus !== null && !focused) || (leaving !== null && leaving !== i);

  return (
    <li className="relative" style={{ width: L.w, marginInline: "-1.6vw", zIndex: focused ? 3 : 2 - Math.abs(1 - i) }}>
      <div className="rise" style={{ animationDelay: `${1.05 + [0.12, 0, 0.22][i]}s`, translate: `0 ${L.y}` }}>
        <motion.div style={{ x: live ? px : 0, y: live ? py : 0 }}>
          <Link
            ref={ref}
            href={productHref(p)}
            onClick={(e) => onChoose(p, i, ref.current)(e)}
            onMouseEnter={onFocus}
            onMouseLeave={onBlur}
            onFocus={onFocus}
            onBlur={onBlur}
            aria-label={`${p.name} — ${p.expression}`}
            className="group block outline-none"
          >
            <motion.div
              className="relative"
              animate={{
                scale: focused ? 1.045 : dimmed ? 0.97 : 1,
                y: focused ? -10 : 0,
                // the chosen piece hands over to the transition's copy of itself
                opacity: leaving === i ? 0 : dimmed ? 0.42 : 1,
                filter: dimmed ? "blur(2.5px) saturate(0.7)" : "blur(0px) saturate(1)",
              }}
              transition={leaving === i ? { duration: 0.01, delay: 0.05 } : { duration: 1.1, ease: ease.lux }}
            >
              <div className={reduce ? "" : "anim-breathe"} style={{ animationDelay: `${-i * 3}s` }}>
                <Image
                  src={p.media.plate.src}
                  alt={p.media.plate.alt}
                  width={p.media.plate.width}
                  height={p.media.plate.height}
                  sizes={PLATE_SIZES}
                  quality={90}
                  priority
                  className="w-full h-auto"
                />
              </div>
              {/* the eye, brought into focus */}
              <FocusRing on={focused} eye={p.media.plate.eye} />
            </motion.div>

            {/* name */}
            <div className="relative -mt-[4%] text-center">
              <p className="t-eyebrow !text-[12px] tabular-nums !text-faint">{p.index}</p>
              <p className="t-name text-[clamp(0.8rem,1.05vw,1rem)] mt-2">{p.name}</p>
              <AnimatePresence>
                {focused && (
                  <motion.p
                    className="t-eyebrow !text-[12px] mt-2.5"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.6, ease: ease.lux }}
                  >
                    {p.expression}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </Link>
        </motion.div>
      </div>
    </li>
  );
}

/** A hairline almond drawn around the bracelet's own eye. */
function FocusRing({ on, eye }: { on: boolean; eye: { x: number; y: number } }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 56"
      className="absolute w-[30%] pointer-events-none text-[var(--c-strong)] overflow-visible"
      style={{ left: `${eye.x}%`, top: `${eye.y}%`, transform: "translate(-50%, -50%)" }}
      fill="none"
    >
      <motion.path
        d={almondPath(1)}
        stroke="currentColor"
        strokeWidth={0.8}
        vectorEffect="non-scaling-stroke"
        initial={false}
        animate={{ pathLength: on ? 1 : 0, opacity: on ? 0.55 : 0 }}
        transition={{ duration: on ? 1.1 : 0.4, ease: ease.lux }}
      />
    </svg>
  );
}

/** The cursor: a closed lid; over a piece it opens and says "Explore". */
function EyeCursor({ open, label }: { open: boolean; label: string }) {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
      <svg viewBox="0 0 100 56" className="w-[54px] text-[var(--c-strong)] overflow-visible" fill="none">
        <motion.path
          stroke="currentColor"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          initial={false}
          animate={{ d: almondPath(open ? 1 : 0.08) }}
          transition={{ duration: 0.6, ease: ease.lux }}
        />
        <motion.circle cx={50} cy={28} fill="currentColor" initial={false} animate={{ r: open ? 3.4 : 1.6 }} transition={{ duration: 0.5 }} />
      </svg>
      <motion.span
        className="t-eyebrow !text-[11px] !text-[var(--c-strong)] mt-1.5 whitespace-nowrap"
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: open ? 0 : -4 }}
        transition={{ duration: 0.4 }}
      >
        {label}
      </motion.span>
    </div>
  );
}

/* ---- Phones: a rail of pieces ------------------------------------------- */

function MobileRail({ onChoose, reduce }: { onChoose: PieceProps["onChoose"]; reduce: boolean }) {
  const rail = useRef<HTMLUListElement>(null);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState(1);

  // which slide is nearest the centre of the rail
  const onScroll = () => {
    const el = rail.current;
    if (!el) return;
    const mid = el.getBoundingClientRect().left + el.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const r = (c as HTMLElement).getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    setActive(best);
  };

  // start on the centre piece (and stay honest if the layout settles late)
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const centre = () => {
      const slide = el.children[1] as HTMLElement | undefined;
      if (!slide) return;
      const r = slide.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      el.scrollLeft += r.left + r.width / 2 - (box.left + box.width / 2);
      onScroll();
    };
    centre();
    const t = window.setTimeout(centre, 400);
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="md:hidden absolute inset-x-0 top-[10svh] bottom-[40svh] flex flex-col">
      <ul ref={rail} onScroll={onScroll} className="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory no-scrollbar px-[9vw]">
        {products.map((p, i) => (
          <li key={p.id} className="snap-center shrink-0 w-[82vw]">
            <div className="rise" style={{ animationDelay: `${1.05 + i * 0.1}s` }}>
              <Link
                ref={(el) => {
                  refs.current[i] = el;
                }}
                href={productHref(p)}
                onClick={(e) => onChoose(p, i, refs.current[i])(e)}
                aria-label={`${p.name} — ${p.expression}`}
                className="block transition-[opacity,transform,filter] duration-700"
                style={{
                  opacity: active === i ? 1 : 0.45,
                  transform: `scale(${active === i ? 1 : 0.9})`,
                  filter: active === i ? "none" : "blur(1.5px)",
                }}
              >
                <Image
                  src={p.media.plate.src}
                  alt={p.media.plate.alt}
                  width={p.media.plate.width}
                  height={p.media.plate.height}
                  sizes={PLATE_SIZES}
                  quality={90}
                  priority={i === 1}
                  className="w-[118%] max-w-none -ml-[9%] h-auto"
                />
                <div className="text-center -mt-[3%]">
                  <p className="t-name text-[0.92rem]">{p.name}</p>
                  <p className="t-eyebrow !text-[11.5px] mt-2">{p.expression}</p>
                </div>
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {/* where you are: three small eyes */}
      <div className="flex justify-center gap-3 pt-4" aria-hidden>
        {products.map((p, i) => (
          <EyeMark key={p.id} className="w-5 text-[var(--c-strong)] transition-opacity duration-500" open={active === i ? 1 : 0.15} />
        ))}
      </div>
    </div>
  );
}
