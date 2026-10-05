/* ==========================================================================
   THE STAGE GEOMETRY — where a bracelet sits when it is "presented".
   The product page hero (CSS, .plate-stage in globals.css) and the opening
   transition (JS, below) must place the bracelet in exactly the same spot,
   so that arriving on a piece's page is one continuous movement. Change one,
   change both.
   ========================================================================== */

/** Plates are 1605 × 891. */
export const PLATE_RATIO = 891 / 1605;

export function stageBox(vw: number, vh: number) {
  const mobile = vw < 768;
  const w = mobile ? vw * 1.04 : Math.min(vw * 0.6, 1040, vh * 1.05);
  const h = w * PLATE_RATIO;
  const cy = vh * (mobile ? 0.46 : 0.53);
  return { left: (vw - w) / 2, top: cy - h / 2, width: w, height: h };
}

/** `sizes` shared by every presentation of a plate, so the browser reuses one file. */
export const PLATE_SIZES = "(max-width: 767px) 104vw, 60vw";
