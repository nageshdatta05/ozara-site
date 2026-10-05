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
  /** Upright crop, the eye at its centre. */
  portrait: ImageAsset;
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
  wave: { piece: [2400, 1340], eye: [960, 904], wide: [1403, 766], curve: [1007, 948], hinge: [1007, 615], gemEye: [1792, 1344], gemDetail: [1541, 1156] },
  flow: { piece: [2400, 1600], eye: [1200, 1130], wide: [1809, 987], curve: [922, 868], hinge: [922, 563], gemEye: [1571, 1178], gemDetail: [1352, 1014] },
  line: { piece: [2400, 1600], eye: [1200, 1130], wide: [2000, 1092], curve: [922, 868], hinge: [922, 563], gemEye: [1714, 1286], gemDetail: [1290, 968] },
} as const;

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
  const p = `/media/collection/${key}`;
  const s = SIZES[key];
  const stonePhotos: BraceletMedia["stonePhotos"] = {};
  const stonePortraits: BraceletMedia["stonePortraits"] = {};
  for (const [k, plural] of STONES) {
    stonePhotos[k] = [
      img(`${p}/${k}-piece.jpg`, 2400, 1600, `${name} in ${metal}, set with ${plural}, on marble`, "50% 50%"),
      img(`${p}/${k}-eye.jpg`, s.gemEye[0], s.gemEye[1], `The eye of ${name} — a ${k} in the star, ${plural} either side`),
      img(`${p}/${k}-detail.jpg`, s.gemDetail[0], s.gemDetail[1], `The ${plural} set along the band of ${name}`),
    ];
    stonePortraits[k] = img(`${p}/${k}-portrait.jpg`, 1400, 1750, `${name} set with ${plural}`, "50% 55%");
  }
  return {
    plate: { ...img(`${p}/plate-cut.png`, 1605, 891, `${name} in ${metal}`), eye },
    hero: img(`${p}/campaign.jpg`, 2400, 1332, `${name} in ${metal} on marble, in window light`, "50% 50%"),
    studio: img(`${p}/piece.jpg`, s.piece[0], s.piece[1], `${name} in ${metal}, the OZARA eye at its centre`, "50% 50%"),
    eyeMacro: img(`${p}/eye.jpg`, s.eye[0], s.eye[1], `Close-up of the OZARA eye on ${name}`),
    curveMacro: img(`${p}/curve.jpg`, s.curve[0], s.curve[1], `The band of ${name}, where it crosses and turns`),
    hinge: img(`${p}/hinge-detail.jpg`, s.hinge[0], s.hinge[1], `The hinge of ${name}`),
    nfcEye: img(`${p}/eye-wide.jpg`, s.wide[0], s.wide[1], `The eye of ${name}, where the bracelet meets your phone`, "50% 50%"),
    portrait: img(`${p}/portrait.jpg`, 1400, 1750, `${name} in ${metal}`, "50% 55%"),
    stonePhotos,
    stonePortraits,
    ...extra,
  };
}

export const collectionMedia = {
  wave: bracelet("wave", "The Wave", "rose gold", { x: 43.2, y: 61.6 }),
  flow: bracelet("flow", "The Flow", "silver", { x: 46.6, y: 67 }),
  line: bracelet("line", "The Line", "black", { x: 48.6, y: 67.9 }),
};

/* Diamond: photographed for the Flow and the Line (Oct 2026). The Wave's
   diamond photograph shows an earlier form of the piece, so it is not used. */
collectionMedia.flow.stonePhotos.diamond = [
  img("/media/collection/flow/diamond-piece.jpg", 1536, 1024, "The Flow with diamonds, on marble in soft light", "50% 55%"),
  img("/media/collection/flow/diamond-eye.jpg", 1536, 1024, "The eye of The Flow, a diamond in the star and diamonds either side"),
  img("/media/collection/flow/diamond-detail.jpg", 1400, 985, "The eye and diamonds of The Flow, seen at an angle"),
];
collectionMedia.line.stonePhotos.diamond = [
  img("/media/collection/line/diamond-piece.jpg", 1536, 1024, "The Line with diamonds, on marble in soft light", "50% 55%"),
  img("/media/collection/line/diamond-eye.jpg", 1600, 800, "The eye of The Line, a diamond in the star and diamonds either side"),
  img("/media/collection/line/diamond-detail.jpg", 1400, 744, "The diamonds set along the band of The Line"),
];

export type CollectionKey = keyof typeof collectionMedia;

/** Shared, non-product imagery. */
export const media = {
  /** The key technology image: the Flow's eye carrying the NFC mark. */
  nfcEye: collectionMedia.flow.nfcEye,
  /** The campaign frame used for social sharing. */
  share: collectionMedia.flow.hero,
} satisfies Record<string, ImageAsset>;
