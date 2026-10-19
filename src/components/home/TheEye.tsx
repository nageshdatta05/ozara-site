"use client";

import { getImageProps } from "next/image";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { copy } from "@/content/copy";
import { collectionMedia } from "@/data/media";
import { starPath } from "@/components/brand/Emblem";
import { useCinematic } from "@/lib/hooks";
import { ease } from "@/lib/motion";

/* ==========================================================================
   FOCUS — the emblem becomes the eye; the eye becomes the tap.
   The ring of the emblem flattens into the almond of the bracelet's eye; the
   real eye appears inside it; then the eye carrying the NFC mark.
   Pinned on large screens; a simple sequence on phones.
   ========================================================================== */

// Ring → almond, as four cubic segments with matching structure, so the
// numbers can be interpolated directly. Centre (0,0).
function shape(t: number) {
  const R = 100;
  const k = 0.5523 * R;
  const W = 150;
  const H = 62;
  const lerp = (a: number, b: number) => a + (b - a) * t;
  const top = lerp(-R, -H);
  const side = lerp(R, W);
  const c1 = lerp(k, W * 0.42); // control along the top
  const c2 = lerp(-k, -H * 0.12); // control near the point
  const pt = (x: number, y: number) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  return [
    `M${pt(0, top)}`,
    `C${pt(c1, top)} ${pt(side, c2)} ${pt(side, 0)}`,
    `C${pt(side, -c2)} ${pt(c1, -top)} ${pt(0, -top)}`,
    `C${pt(-c1, -top)} ${pt(-side, -c2)} ${pt(-side, 0)}`,
    `C${pt(-side, c2)} ${pt(-c1, top)} ${pt(0, top)}Z`,
  ].join(" ");
}

/* The eye photograph (eye straight on): the real eye spans about 65% of its width
   and the star sits at its centre, so at this size the eye fills the almond. */
const EYE_PHOTO = { x: -196, y: -190, width: 393, height: 370 };

function useEyeSrc() {
  const m = collectionMedia.flow.eyeFront;
  // optimised URL for SVG <image> (next/image can't sit inside an SVG)
  return getImageProps({ src: m.src, alt: "", width: m.width, height: m.height, quality: 90 }).props.src;
}

function TapRings() {
  return (
    <g fill="none" stroke="var(--c-strong)" strokeWidth={0.7}>
      {[0, 1, 2].map((i) => (
        <motion.ellipse
          key={i}
          cx={0}
          cy={0}
          initial={{ rx: 150, ry: 62, opacity: 0 }}
          animate={{ rx: [150, 205], ry: [62, 118], opacity: [0.55, 0] }}
          transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </g>
  );
}

/* The almond with the real eye inside, still — for phones and reduced motion. */
function EyeStill({ tap = false }: { tap?: boolean }) {
  const src = useEyeSrc();
  return (
    <svg viewBox="-170 -120 340 240" className="w-[86%] mx-auto overflow-visible" aria-hidden>
      <defs>
        <clipPath id={tap ? "eye-clip-tap" : "eye-clip-still"}>
          <path d={shape(1)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${tap ? "eye-clip-tap" : "eye-clip-still"})`}>
        <image href={src} {...EYE_PHOTO} preserveAspectRatio="xMidYMid slice" />
      </g>
      <path d={shape(1)} fill="none" stroke="var(--c-strong)" strokeWidth={0.8} opacity={0.25} />
      {tap && <TapRings />}
    </svg>
  );
}

export function TheEye() {
  const { cinematic } = useCinematic();
  return cinematic ? <Pinned /> : <Sequence />;
}

function Pinned() {
  const c = copy.eye;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stage, setStage] = useState(0);
  useMotionValueEvent(p, "change", (v) => setStage(v < 0.33 ? 0 : v < 0.66 ? 1 : 2));

  const morph = useTransform(p, [0.12, 0.38], [0, 1], { clamp: true });
  const d = useTransform(morph, shape);
  const crossOpacity = useTransform(morph, [0, 0.6], [0.55, 0]);
  const photo = useTransform(p, [0.36, 0.5], [0, 1]);
  const photoScale = useTransform(p, [0.36, 0.62], [1.25, 1]);
  const nfc = useTransform(p, [0.66, 0.78], [0, 1]);
  const lineOpacity = useTransform(p, [0.4, 0.55], [0.7, 0.25]);

  return (
    <section ref={ref} aria-label={c.eyebrow} className="relative h-[320vh] bg-paper">
      <div className="sticky top-0 h-[100svh] overflow-hidden grid grid-cols-12 items-center shell">
        <div className="col-span-7 relative h-[70svh] flex items-center justify-center">
          <EyeFigure d={d} cross={crossOpacity} photo={photo} photoScale={photoScale} nfc={nfc} line={lineOpacity} />
        </div>
        <div className="col-span-4 col-start-9">
          <p className="t-eyebrow mb-10">{c.eyebrow}</p>
          <div className="relative h-[17rem]">
            {c.stages.map((s, i) => (
              <motion.div
                key={s.kicker}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: stage === i ? 1 : 0, y: stage === i ? 0 : stage > i ? -16 : 16, filter: stage === i ? "blur(0px)" : "blur(4px)" }}
                transition={{ duration: 0.9, ease: ease.lux }}
                aria-hidden={stage !== i}
              >
                <p className="t-eyebrow !text-[var(--c-accent)] tabular-nums">0{i + 1} — {s.kicker}</p>
                <h2 className="t-title mt-5">{s.title}</h2>
                <p className="t-body mt-5 max-w-[34ch]">{s.body}</p>
              </motion.div>
            ))}
          </div>
          {/* progress: three hairlines */}
          <div className="flex gap-2 mt-6" aria-hidden>
            {c.stages.map((_, i) => (
              <span key={i} className="h-px w-10 transition-colors duration-700" style={{ background: stage >= i ? "var(--c-strong)" : "var(--c-line-strong)" }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EyeFigure({
  d,
  cross,
  photo,
  photoScale,
  nfc,
  line,
}: {
  d: MotionValue<string>;
  cross: MotionValue<number>;
  photo: MotionValue<number>;
  photoScale: MotionValue<number>;
  nfc: MotionValue<number>;
  line: MotionValue<number>;
}) {
  const macroSrc = useEyeSrc();
  return (
    <svg viewBox="-170 -120 340 240" className="w-full max-w-[640px] overflow-visible" aria-hidden>
      <defs>
        <clipPath id="eye-clip">
          <motion.path d={d} />
        </clipPath>
      </defs>
      {/* the real eye, inside the almond — scaled so its outline meets the almond and the star sits at the centre */}
      <g clipPath="url(#eye-clip)">
        <motion.g style={{ opacity: photo, scale: photoScale }}>
          <image href={macroSrc} {...EYE_PHOTO} preserveAspectRatio="xMidYMid slice" />
        </motion.g>
      </g>
      {/* the tap: rings travelling out from the star */}
      <motion.g style={{ opacity: nfc }}>
        <TapRings />
      </motion.g>
      {/* the emblem's ring, becoming the lid */}
      <motion.path d={d} fill="none" stroke="var(--c-strong)" strokeWidth={0.8} style={{ opacity: line }} />
      <motion.g style={{ opacity: cross }} stroke="var(--c-strong)" strokeWidth={0.6}>
        <line x1="0" y1="-100" x2="0" y2="100" />
        <line x1="-100" y1="0" x2="100" y2="0" />
      </motion.g>
      <motion.path d={starPath(0, 0, 58, 50, 7)} fill="none" stroke="var(--c-strong)" strokeWidth={0.8} style={{ opacity: cross }} />
    </svg>
  );
}

/* Phones & reduced motion: the same three moments, one after another. */
function Sequence() {
  const c = copy.eye;
  const visuals = [
    <svg key="e" viewBox="-170 -120 340 240" className="w-[72%] mx-auto" aria-hidden>
      <path d={shape(0)} fill="none" stroke="var(--c-strong)" strokeWidth={0.8} />
      <g stroke="var(--c-strong)" strokeWidth={0.6} opacity={0.55}>
        <line x1="0" y1="-100" x2="0" y2="100" />
        <line x1="-100" y1="0" x2="100" y2="0" />
      </g>
      <path d={starPath(0, 0, 58, 50, 7)} fill="none" stroke="var(--c-strong)" strokeWidth={0.8} />
    </svg>,
    <EyeStill key="m" />,
    <EyeStill key="n" tap />,
  ];
  return (
    <section aria-label={c.eyebrow} className="relative bg-paper section-pad">
      <div className="shell">
        <p className="t-eyebrow text-center">{c.eyebrow}</p>
        <div className="mt-14 space-y-20">
          {c.stages.map((s, i) => (
            <motion.div
              key={s.kicker}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.1, ease: ease.lux }}
            >
              {visuals[i]}
              <div className="mt-8 text-center">
                <p className="t-eyebrow !text-[var(--c-accent)] tabular-nums">0{i + 1} — {s.kicker}</p>
                <h2 className="t-title mt-4 max-w-[18ch] mx-auto">{s.title}</h2>
                <p className="t-body mt-4 max-w-[34ch] mx-auto">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
