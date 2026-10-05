import Image from "next/image";

/* ==========================================================================
   THE STONES — photographed loose stones, cut out to transparent PNGs from
   the gemstone reference image supplied by OZARA (Oct 2026): an oval
   sapphire, a cushion ruby and a round brilliant diamond. The rectangular
   emerald and the pear amethyst are made from stones in the same image,
   re-coloured and re-shaped so that every stone has its own cut. Files: /public/media/gems/<kind>.png.
   To swap a stone, replace its file and update its size below.
   ========================================================================== */

export type GemKind = "sapphire" | "ruby" | "emerald" | "amethyst" | "diamond";

const FILES: Record<GemKind, { w: number; h: number }> = {
  sapphire: { w: 315, h: 235 },
  ruby: { w: 174, h: 176 },
  emerald: { w: 195, h: 240 },
  amethyst: { w: 228, h: 308 },
  diamond: { w: 82, h: 82 },
};

/** Width / height of each stone image. */
export const GEM_RATIO = Object.fromEntries(Object.entries(FILES).map(([k, v]) => [k, v.w / v.h])) as Record<GemKind, number>;

export function Gem({ kind, className = "", style }: { kind: GemKind; className?: string; style?: React.CSSProperties }) {
  const f = FILES[kind];
  return <Image src={`/media/gems/${kind}.png`} alt="" width={f.w} height={f.h} className={className} style={style} aria-hidden />;
}
