"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { GemKey, Product } from "@/data/products";
import { Gem, GEM_RATIO } from "./Gem";
import { ease } from "@/lib/motion";

/**
 * The bracelet as configured: the studio photograph, with the chosen stones
 * set into small bezels on the band either side of the eye. The eye itself is
 * never covered. With no stone chosen this is simply the Base Model.
 */
export function StonePreview({ product: p, gem }: { product: Product; gem: GemKey | null }) {
  const img = p.media.studio;
  const st = p.setting;
  return (
    <div className="absolute inset-0">
      {/* the frame keeps the photograph's own proportions so the settings stay on the band */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-full -translate-x-1/2" style={{ aspectRatio: `${img.width} / ${img.height}` }}>
          <Image src={img.src} alt={img.alt} fill sizes="(min-width:1024px) 56vw, 100vw" quality={88} className="object-fill" />
          <AnimatePresence>
            {gem &&
              (["left", "right"] as const).map((side, i) => (
                <Setting key={`${gem}-${side}`} at={st[side]} size={st.size} squash={st.squash} metal={st.metal} gem={gem} delay={i * 0.12} />
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Setting({
  at,
  size,
  squash,
  metal,
  gem,
  delay,
}: {
  at: { x: number; y: number };
  size: number;
  squash: number;
  metal: string;
  gem: GemKey;
  delay: number;
}) {
  const ratio = GEM_RATIO[gem];
  // every stone fits the same setting; long stones lie along the band
  const lie = ratio < 0.9;
  return (
    <motion.div
      aria-hidden
      className="absolute"
      style={{ left: `${at.x}%`, top: `${at.y}%`, width: `${size}%`, aspectRatio: "1", translate: "-50% -50%" }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.7, ease: ease.lux, delay }}
    >
      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `scaleY(${squash})` }}>
        {/* bezel */}
        <div
          className="absolute inset-[-14%] rounded-full"
          style={{
            background: `radial-gradient(circle at 38% 30%, color-mix(in srgb, ${metal} 70%, white) 0%, ${metal} 55%, color-mix(in srgb, ${metal} 60%, black) 100%)`,
            boxShadow: "0 1.5px 2px rgb(0 0 0 / 0.35), inset 0 0 0 0.5px rgb(0 0 0 / 0.25)",
          }}
        />
        <Gem
          kind={gem}
          className="relative block"
          style={{
            width: lie ? `${90 * ratio}%` : "90%",
            transform: lie ? "rotate(90deg)" : undefined,
            filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.4))",
          }}
        />
      </div>
    </motion.div>
  );
}
