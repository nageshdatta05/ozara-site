"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { ease } from "@/lib/motion";

type Item = { title: string; body: string };

/** Hairline accordion — one panel open at a time. */
export function Accordion({ items, className = "", large = false }: { items: Item[]; className?: string; large?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  return (
    <div className={`border-t border-line ${className}`}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.title} className="border-b border-line">
            <h3>
              <button
                type="button"
                id={`${id}-h${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className={`w-full flex items-center justify-between gap-6 text-left ${large ? "py-7" : "py-5"}`}
              >
                <span className={large ? "t-subtitle text-platinum" : "t-eyebrow !text-platinum/85"}>{it.title}</span>
                <span aria-hidden className="relative size-3 shrink-0">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-platinum/70" />
                  <span
                    className="absolute inset-y-0 left-1/2 w-px bg-platinum/70 transition-transform duration-500"
                    style={{ transform: `scaleY(${isOpen ? 0 : 1})` }}
                  />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-p${i}`}
                  role="region"
                  aria-labelledby={`${id}-h${i}`}
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.7, ease: ease.lux }}
                >
                  <p className={`t-body max-w-[60ch] ${large ? "pb-8" : "pb-6 !text-[1rem]"}`}>{it.body}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
