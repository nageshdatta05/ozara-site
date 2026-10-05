"use client";

import Image from "next/image";
import { motion, useTransform } from "motion/react";
import { useRef } from "react";
import type { ImageAsset } from "@/data/media";
import { useReducedMotion } from "@/lib/hooks";
import { usePhotoScrollProgress } from "@/lib/scrollProgress";

type Props = {
  image: ImageAsset;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Vertical parallax travel as a % of the frame (0 = none). */
  parallax?: number;
  /** Slow push-in as the frame scrolls through the viewport. */
  zoom?: boolean;
  /** Override the asset's focal point. */
  position?: string;
  fit?: "cover" | "contain";
};

/**
 * A photograph that fills its frame. The frame is sized by the caller; the
 * image is over-scaled slightly so parallax never reveals an edge.
 */
export function Photo({
  image,
  className = "",
  imageClassName = "",
  sizes = "100vw",
  priority = false,
  parallax = 0,
  zoom = false,
  position,
  fit = "cover",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const active = !reduce && (parallax > 0 || zoom);
  // only frames that move follow the scroll (still ones cost nothing)
  const scrollYProgress = usePhotoScrollProgress(ref, active);
  const y = useTransform(scrollYProgress, [0, 1], active && parallax ? [`-${parallax}%`, `${parallax}%`] : ["0%", "0%"]);
  const scale = useTransform(scrollYProgress, [0, 1], active && zoom ? [1.14, 1.02] : [1, 1]);
  const overscan = parallax ? 1 + (parallax * 2.2) / 100 : 1;

  return (
    <div ref={ref} className={`overflow-hidden ${/\b(absolute|fixed|sticky)\b/.test(className) ? "" : "relative"} ${className}`}>
      <motion.div className="absolute inset-0 will-change-transform" style={{ y, scale }}>
        <div className="absolute inset-0" style={{ transform: overscan > 1 ? `scale(${overscan})` : undefined }}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={sizes}
            priority={priority}
            quality={88}
            className={`${fit === "cover" ? "object-cover" : "object-contain"} ${imageClassName}`}
            style={{ objectPosition: position ?? image.position ?? "50% 50%" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
