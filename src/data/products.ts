/* ==========================================================================
   PRODUCT CATALOGUE — the single source of truth for every piece.

   Each product powers the opening, its collection entry, its page at
   /shop/[slug] and any section that features it. To:
   • add a price      → set `price: { amount: 450, currency: "GBP" }`
   • open sales       → set `availability: "available"` and `checkoutUrl`
   • add materials    → fill `materials` (strings); same for `features`
   • add sizes        → `variants.sizes`
   • add specs        → `specs: [{ label: "Width", value: "6 mm" }]`
   • swap imagery     → replace the files in /public/media/collection/<key>
   Anything left `null` is simply not shown.

   Names, the three-word expressions, the sign-offs and the design notes come
   from the OZARA design boards. Metal, dimensions and prices are not yet
   confirmed, so none are stated: finishes are described by colour only.
   ========================================================================== */

import { collectionMedia, type BraceletMedia, type CollectionKey, type ImageAsset } from "./media";
import { launch } from "@/config/site";

export type Availability = "available" | "preorder" | "coming-soon" | "waitlist" | "sold-out";

export type Product = {
  id: string;
  key: CollectionKey;
  slug: string;
  /** Display index — "01", "02" … */
  index: string;
  name: string;
  /** The three-word expression from the design board, e.g. "Fluid. Refined. Timeless." */
  expression: string;
  /** The board's closing line, e.g. "Effortless. Iconic." */
  signoff: string;
  /** Finish, described by colour only. */
  finish: string;
  /** The piece's own tone — tints its stage, its transition and its accents. */
  tone: { hue: string; wash: string; ink: "light" | "dark" };
  /** One line about the form, from the design board. */
  form: string;
  /**
   * Where stones are set on the studio photograph (percent of the image),
   * either side of the eye — never on it. `size` is the stone width as a
   * percent of the image width; `squash` foreshortens it to the band's angle.
   */
  setting: { left: { x: number; y: number }; right: { x: number; y: number }; size: number; squash: number; metal: string };
  /** Short paragraph for the product page. */
  description: string;
  /** Longer editorial story, split into paragraphs. */
  story: string[];
  media: BraceletMedia;
  /** Lead image for share cards and lists. */
  image: ImageAsset;
  variants?: {
    sizes?: string[];
    finishes?: { name: string; swatch: string }[];
  } | null;
  specs?: { label: string; value: string }[] | null;
  price: { amount: number; currency: string } | null;
  availability: Availability;
  materials: string[] | null;
  features: string[] | null;
  /** When set and the piece is available, the buy button links here. */
  checkoutUrl: string | null;
};

export const products: Product[] = [
  {
    id: "wave",
    key: "wave",
    slug: "the-wave",
    index: "01",
    name: "The Wave",
    expression: "Fluid. Refined. Timeless.",
    signoff: "Effortless. Iconic.",
    finish: "Rose",
    tone: { hue: "#b98e6e", wash: "#eedfd2", ink: "dark" },
    form: "A fluid, ergonomic wave — shaped for everyday comfort.",
    setting: { left: { x: 13.8, y: 61 }, right: { x: 49.5, y: 66 }, size: 3.6, squash: 0.62, metal: "#c9a07c" },
    description:
      "Rising and falling either side of the eye.",
    story: ["The softest of the three — a line that never settles, catching light on every crest."],
    media: collectionMedia.wave,
    image: collectionMedia.wave.hero,
    price: { amount: 15000, currency: "INR" },
    availability: "preorder",
    materials: null,
    features: null,
    checkoutUrl: null,
  },
  {
    id: "flow",
    key: "flow",
    slug: "the-flow",
    index: "02",
    name: "The Flow",
    expression: "Balanced. Bold. Distinctive.",
    signoff: "Structure meets fluidity.",
    finish: "Silver",
    tone: { hue: "#9ea4ab", wash: "#e9e3da", ink: "dark" },
    form: "A sculpted form with refined edges — the band turns as it travels.",
    setting: { left: { x: 29, y: 63.3 }, right: { x: 68.5, y: 62.8 }, size: 3.8, squash: 0.62, metal: "#bfc3c7" },
    description:
      "Polished planes that turn into the eye.",
    story: ["Structure and movement at once — every angle shows a different face of the metal."],
    media: collectionMedia.flow,
    image: collectionMedia.flow.hero,
    price: { amount: 15000, currency: "INR" },
    availability: "preorder",
    materials: null,
    features: null,
    checkoutUrl: null,
  },
  {
    id: "line",
    key: "line",
    slug: "the-line",
    index: "03",
    name: "The Line",
    expression: "Minimal. Modern. Versatile.",
    signoff: "Understated. Unforgettable.",
    finish: "Black",
    tone: { hue: "#3b3835", wash: "#d8cfc4", ink: "light" },
    form: "A slim profile, refined for every wrist.",
    setting: { left: { x: 29.5, y: 63.4 }, right: { x: 67.6, y: 62 }, size: 3.6, squash: 0.6, metal: "#6d6964" },
    description:
      "A slender black band. One bright line.",
    story: ["Says the least, remembered the longest. The star is the only light on the piece."],
    media: collectionMedia.line,
    image: collectionMedia.line.hero,
    price: { amount: 15000, currency: "INR" },
    availability: "preorder",
    materials: null,
    features: null,
    checkoutUrl: null,
  },
];

/* ---- Helpers --------------------------------------------------------------- */

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const getRelated = (slug: string) => products.filter((p) => p.slug !== slug);

export const productHref = (p: Product) => `/shop/${p.slug}`;

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: "Available",
  preorder: "Pre-Order",
  "coming-soon": "Coming soon",
  waitlist: "Waiting list open",
  "sold-out": "Sold out",
};

/** Price when known; otherwise the launch status line. */
export function priceLabel(p: Product): string {
  return p.price ? formatPrice(p.price) : launch.status;
}

export function formatPrice(price: Product["price"]): string {
  if (!price) return launch.status;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount);
}

/** Can be added to the bag: on sale, or open for pre-order. */
export const canReserve = (p: Product) => p.availability === "available" || p.availability === "preorder";
export const isPreorder = (p: Product) => p.availability === "preorder";

/**
 * The stones offered for customisation, in the order they are laid out.
 * Each is drawn by components/product/Gem.tsx. `size` is its width relative
 * to the largest — deliberately unequal, like loose stones laid out by hand.
 * "Base Model" (no stones, just the eye) is the default and is `null`.
 */
export const GEMS = [
  { key: "sapphire", name: "Sapphire", size: 1, glow: "rgb(35 51 180 / 0.5)" },
  { key: "ruby", name: "Ruby", size: 0.55, glow: "rgb(212 18 74 / 0.45)" },
  { key: "emerald", name: "Emerald", size: 0.6, glow: "rgb(20 179 100 / 0.45)" },
  { key: "amethyst", name: "Amethyst", size: 0.6, glow: "rgb(128 52 196 / 0.5)" },
  { key: "diamond", name: "Diamond", size: 0.3, glow: "rgb(120 190 230 / 0.55)" },
] as const;
export const BASE_MODEL = "Base Model";
export type GemKey = (typeof GEMS)[number]["key"];
export const gemName = (k: GemKey | null) => (k ? GEMS.find((g) => g.key === k)!.name : BASE_MODEL);

/**
 * PRICING — set when confirmed. A piece's price is its `price` plus the
 * surcharge for the stones chosen. Pieces with stones are priced by how many
 * stones the customer wants, so these stay null: the price is agreed with them
 * and paid by a Shopify payment link.
 * While any part is null, the site shows "Price on confirmation" and the
 * customer is told the price is confirmed before anything is charged.
 */
export const GEM_SURCHARGE: Record<GemKey, number | null> = {
  sapphire: null,
  ruby: null,
  emerald: null,
  amethyst: null,
  diamond: null,
};

/** The price of one piece as configured, or null if not yet confirmed. */
export function unitPrice(p: Product, gem: GemKey | null): { amount: number; currency: string } | null {
  if (!p.price) return null;
  if (!gem) return p.price;
  const extra = GEM_SURCHARGE[gem];
  return extra === null ? null : { amount: p.price.amount + extra, currency: p.price.currency };
}

/** SIZING — three sizes. The fit is confirmed with the customer before production. */
export const WRIST_SIZES = [
  { key: "S", name: "Small" },
  { key: "M", name: "Medium" },
  { key: "L", name: "Large" },
] as const;
export type WristSize = (typeof WRIST_SIZES)[number]["key"];
// earlier reservations stored centimetres — still shown as they were saved
export const sizeLabel = (s: string | null | undefined) => (!s ? "—" : WRIST_SIZES.find((w) => w.key === s)?.name ?? (/^\d/.test(s) ? `${s} cm` : s));
export const validSize = (s: unknown): s is WristSize => typeof s === "string" && WRIST_SIZES.some((w) => w.key === s);
