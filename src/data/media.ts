/* ==========================================================================
   BRAND MEDIA LIBRARY — curated, grouped by bracelet.

   Source: OZARA product photography (Oct 2026) in /Ozara Media — for each
   bracelet, the plain piece and the piece set with each stone. All crops are
   cut from the originals at full resolution. See IMAGE-GUIDE.md.

   Sections and products reference these entries by name, never by path. To
   replace a photograph, drop the new file into /public/media/… and update
   `src`, `width` and `height` here. `position` is the focal point used when an
   image is cover-cropped.
   ========================================================================== */

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Focal point for cover-cropping, e.g. "70% 50%". */
  position?: string;
};

/**
 * A bracelet cut out from its photograph (macOS Vision subject mask), with a soft
 * contact shadow, so it can sit on any stone-coloured surface. `eye` is where the
 * OZARA eye sits in the image (percent) — the hover focus and the opening
 * transition centre on it.
 */
export type Plate = ImageAsset & { eye: { x: number; y: number } };

const img = (src: string, width: number, height: number, alt: string, position?: string): ImageAsset => ({
  src,
  width,
  height,
  alt,
  position,
});

/** Every image of one bracelet, by role. */
export type BraceletMedia = {
  /** The bracelet cut out from its photograph, with a soft contact shadow — the opening, the collection and the product stage. */
  plate: Plate;
  /** Wide campaign frame on marble, in raking window light. */
  hero: ImageAsset;
  /** The whole piece — the first picture on its product page. */
  studio: ImageAsset;
  /** The eye, close. */
  eyeMacro: ImageAsset;
  /** The crossing of the band. */
  curveMacro: ImageAsset;
  /** The hinge. */
  hinge: ImageAsset;
  /** The eye in a wide frame — where the bracelet meets your phone. */
  nfcEye: ImageAsset;
  /** Upright frame, the piece seen from high above. */
  portrait: ImageAsset;
  /** The eye, straight on and close. */
  eyeFront: ImageAsset;
  /** The whole piece turned, the eye to one side. */
  turn: ImageAsset;
  /** The piece from high above, in a near-square frame. */
  above: ImageAsset;
  /**
   * Photographs of this model set with a stone: the piece, the eye, and the
   * stones close. Shown on the product page when that stone is chosen.
   */
  stonePhotos: Partial<Record<StoneKey, ImageAsset[]>>;
  /** Upright crops of the stone-set pieces. */
  stonePortraits: Partial<Record<StoneKey, ImageAsset>>;
};

type StoneKey = "sapphire" | "ruby" | "emerald" | "amethyst" | "diamond";

/* Pixel sizes of each model's files (the source photographs differ in size). */
const SIZES = {
  wave: { eyeFront: [1900, 1789], turn: [2240, 1792], above: [1519, 1430], campaignH: 1333, piece: [2400, 1600], eye: [1800, 1695], wide: [2274, 1241], curve: [2240, 1792], hinge: [2172, 1328], gemEye: [1792, 1344], gemDetail: [1541, 1156] },
  flow: { eyeFront: [1900, 1789], turn: [2240, 1792], above: [1904, 1792], campaignH: 1333, piece: [2400, 1600], eye: [1800, 1695], wide: [2400, 1310], curve: [2240, 1792], hinge: [2319, 1417], gemEye: [1571, 1178], gemDetail: [1352, 1014] },
} as const;

const SHOW_STONE_PHOTOS = false;

const STONES = [
  ["ruby", "rubies"],
  ["sapphire", "sapphires"],
  ["emerald", "emeralds"],
  ["amethyst", "amethysts"],
] as const;

/*
 * Photography: OZARA product renders, Oct 2026 ("bracelet_*_refined",
 * "bracelet_*_wave_hires" in /Ozara Media) — one plain and four stone-set
 * pictures per model. Every file here is cropped from those originals at
 * full resolution; nothing is enlarged.
 */
function bracelet(key: keyof typeof SIZES, name: string, metal: string, eye: { x: number; y: number }, extra: Partial<BraceletMedia> = {}): BraceletMedia {
  const p = `/media/pieces/${key}`;
  const s = SIZES[key];
  const stonePhotos: BraceletMedia["stonePhotos"] = {};
  const stonePortraits: BraceletMedia["stonePortraits"] = {};
  // Stone-set photographs are hidden until real photos of the final pieces exist:
  // the old ones show an earlier form of the bracelets. Flip SHOW_STONE_PHOTOS to bring them back.
  if (SHOW_STONE_PHOTOS) for (const [k, plural] of STONES) {
    stonePhotos[k] = [
      img(`${p}/${k}-piece.jpg`, 2400, 1600, `${name} in ${metal}, set with ${plural}, on marble`, "50% 50%"),
      img(`${p}/${k}-eye.jpg`, s.gemEye[0], s.gemEye[1], `The eye of ${name} — a ${k} in the star, ${plural} either side`),
      img(`${p}/${k}-detail.jpg`, s.gemDetail[0], s.gemDetail[1], `The ${plural} set along the band of ${name}`),
    ];
    stonePortraits[k] = img(`${p}/${k}-portrait.jpg`, 1400, 1750, `${name} set with ${plural}`, "50% 55%");
  }
  return {
    plate: { ...img(`${p}/plate-cut.png`, 1605, 891, `${name} in ${metal}`), eye },
    hero: img(`${p}/campaign.jpg`, 2400, s.campaignH, `${name} in ${metal} on linen, in window light`, "50% 50%"),
    studio: img(`${p}/piece.jpg`, s.piece[0], s.piece[1], `${name} in ${metal}, the OZARA eye at its centre`, "50% 50%"),
    eyeMacro: img(`${p}/eye.jpg`, s.eye[0], s.eye[1], `Close-up of the OZARA eye on ${name}`),
    curveMacro: img(`${p}/curve.jpg`, s.curve[0], s.curve[1], `${name}, seen from the side of its band`),
    hinge: img(`${p}/hinge-detail.jpg`, s.hinge[0], s.hinge[1], `The hinge of ${name}`),
    nfcEye: img(`${p}/eye-wide.jpg`, s.wide[0], s.wide[1], `The eye of ${name}, where the bracelet meets your phone`, "50% 50%"),
    portrait: img(`${p}/portrait.jpg`, 1400, 1750, `${name} in ${metal}, seen from above`, "50% 55%"),
    eyeFront: img(`${p}/eye-front.jpg`, s.eyeFront[0], s.eyeFront[1], `The eye of ${name}, straight on`),
    turn: img(`${p}/turn.jpg`, s.turn[0], s.turn[1], `${name} in ${metal}, turned`),
    above: img(`${p}/above.jpg`, s.above[0], s.above[1], `${name} in ${metal}, seen from above`),
    stonePhotos,
    stonePortraits,
    ...extra,
  };
}

export const collectionMedia = {
  wave: bracelet("wave", "The Wave", "gold", { x: 49.6, y: 61.4 }, { plate: { src: "/media/pieces/wave/plate-cut.png", width: 1826, height: 765, alt: "The Wave in gold", eye: { x: 49.6, y: 61.4 } } }),
  flow: bracelet("flow", "The Flow", "silver", { x: 49.5, y: 63.8 }, { plate: { src: "/media/pieces/flow/plate-cut.png", width: 1935, height: 765, alt: "The Flow in silver", eye: { x: 49.5, y: 63.8 } } }),
};

/* Diamond: photographed for the Flow (Oct 2026). The Wave's
   diamond photograph shows an earlier form of the piece, so it is not used. */
if (SHOW_STONE_PHOTOS) collectionMedia.flow.stonePhotos.diamond = [
  img("/media/pieces/flow/diamond-piece.jpg", 1536, 1024, "The Flow with diamonds, on marble in soft light", "50% 55%"),
  img("/media/pieces/flow/diamond-eye.jpg", 1536, 1024, "The eye of The Flow, a diamond in the star and diamonds either side"),
  img("/media/pieces/flow/diamond-detail.jpg", 1400, 985, "The eye and diamonds of The Flow, seen at an angle"),
];

export type CollectionKey = keyof typeof collectionMedia;

/** Shared, non-product imagery. */
export const media = {
  /** The key technology image: the Flow's eye carrying the NFC mark. */
  nfcEye: collectionMedia.flow.nfcEye,
  /** Both pieces together, on linen: link previews and the collection section. */
  pair: img("/media/share/pair-high.jpg", 2400, 1600, "The Wave in gold and the Flow in silver, side by side on linen", "50% 50%"),
} satisfies Record<string, ImageAsset>;
