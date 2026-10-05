"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { fadeUp } from "@/lib/motion";

type Props = HTMLMotionProps<"div"> & { index?: number };

/** Fade + translate on first entry into the viewport. */
export function Reveal({ index = 0, children, ...rest }: Props) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
