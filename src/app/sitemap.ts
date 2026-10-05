import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/shop", "/technology", "/authenticity", "/about", "/faq", "/contact", "/privacy", "/terms"];
  const now = new Date();
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, lastModified: now, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...products.map((p) => ({ url: `${site.url}/shop/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
