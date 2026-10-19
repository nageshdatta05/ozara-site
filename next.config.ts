import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Development only: lets the dev server work through temporary public tunnels.
  allowedDevOrigins: ["*.trycloudflare.com", "*.lhr.life"],
  images: {
    // WebP only: AVIF encoding (sharp/libvips) needs a lot of memory and CPU per
    // image and kept pushing the 1 GB Railway container out of memory.
    formats: ["image/webp"],
    qualities: [75, 88, 90],
    // Fewer generated widths = fewer encodes; optimised files are cached for 30 days.
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    // Optimise one image at a time instead of one per CPU core: keeps peak memory low.
    imgOptConcurrency: 1,
  },
  // Basic browser protections on every page. (No Content-Security-Policy yet: it needs
  // careful testing against the checkout and animations before it is switched on.)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
    ];
  },
  // The placeholder catalogue was replaced by the Wave and the Flow (the Line was dropped in Oct 2026).
  async redirects() {
    return [
      { source: "/shop/the-signature", destination: "/shop/the-flow", permanent: true },
      { source: "/shop/the-essential", destination: "/shop", permanent: false },
      { source: "/shop/the-edition", destination: "/shop/the-wave", permanent: true },
      // Renamed Oct 2026: Velora → Wave, Ora → Flow, Nimbus → Line.
      { source: "/shop/the-velora", destination: "/shop/the-wave", permanent: true },
      { source: "/shop/the-ora", destination: "/shop/the-flow", permanent: true },
      { source: "/shop/the-nimbus", destination: "/shop", permanent: false },
      { source: "/shop/the-line", destination: "/shop", permanent: false },
    ];
  },
};

export default nextConfig;
