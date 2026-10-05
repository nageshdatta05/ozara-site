import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/** Private areas (accounts, checkout, staff tools, bracelet records) stay out of search. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/account", "/checkout", "/verify", "/b/"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
