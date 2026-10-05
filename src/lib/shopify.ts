import { shopify } from "@/config/site";

type Line = { slug: string; gem: string | null; size: string; qty: number };

/**
 * Shopify checkout for a bag of Base Models: a cart link that opens the
 * store's checkout with each piece, size and quantity already in it.
 * Returns null when the bag has a piece with stones (those are priced with the
 * customer first) or a piece/size Shopify doesn't know.
 */
export function shopifyCheckoutUrl(lines: Line[]): string | null {
  if (!lines.length || lines.some((l) => l.gem)) return null;
  const parts: string[] = [];
  for (const l of lines) {
    const id = shopify.baseModel[l.slug]?.[l.size];
    if (!id) return null;
    parts.push(`${id}:${l.qty}`);
  }
  return `https://${shopify.store}/cart/${parts.join(",")}`;
}
