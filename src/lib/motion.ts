/* Motion tokens — mirrors the CSS custom properties in tokens.css. */

export const ease = {
  lux: [0.22, 1, 0.36, 1] as const,
  silk: [0.65, 0, 0.35, 1] as const,
};

export const dur = {
  fast: 0.35,
  base: 0.8,
  slow: 1.4,
  cinematic: 2.2,
};

/** Standard "rise from a mask" reveal used for headlines. */
export const riseIn = {
  hidden: { y: "108%" },
  show: (i = 0) => ({
    y: "0%",
    transition: { duration: 1, ease: ease.lux, delay: i * 0.07 },
  }),
};

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: ease.lux, delay: i * 0.06 },
  }),
};

/** Parse "*word*" markup into segments for italic emphasis. */
export function parseEmphasis(line: string): { text: string; em: boolean }[] {
  return line
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((s) => (s.startsWith("*") ? { text: s.slice(1, -1), em: true } : { text: s, em: false }));
}

export const plain = (lines: string[]) => lines.join(" ").replace(/\*/g, "");
