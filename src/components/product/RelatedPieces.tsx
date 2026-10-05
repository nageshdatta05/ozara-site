"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { productHref, type Product } from "@/data/products";
import { usePieceTransition } from "@/components/transition/PieceTransition";
import { PLATE_SIZES } from "@/lib/stage";

/** The other pieces, on the same stone — choosing one opens it the same way. */
export function RelatedPieces({ items }: { items: Product[] }) {
  return (
    <ul className="grid sm:grid-cols-2 gap-12 sm:gap-6">
      {items.map((p) => (
        <Item key={p.id} p={p} />
      ))}
    </ul>
  );
}

function Item({ p }: { p: Product }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { present } = usePieceTransition();
  return (
    <li>
      <Link
        ref={ref}
        href={productHref(p)}
        className="group block text-center"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          present(p, { rect: ref.current?.querySelector("img")?.getBoundingClientRect() });
        }}
      >
        <Image
          src={p.media.plate.src}
          alt={p.media.plate.alt}
          width={p.media.plate.width}
          height={p.media.plate.height}
          sizes={PLATE_SIZES}
          quality={90}
          className="w-full h-auto transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:-translate-y-2 group-hover:scale-[1.02]"
        />
        <p className="t-name text-[0.97rem] -mt-[3%]">{p.name}</p>
        <p className="t-eyebrow !text-[12px] mt-2.5">{p.expression}</p>
      </Link>
    </li>
  );
}
