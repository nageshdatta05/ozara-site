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
  // The placeholder catalogue was replaced by the Wave, the Flow and the Line.
  async redirects() {
    return [
      { source: "/shop/the-signature", destination: "/shop/the-flow", permanent: true },
      { source: "/shop/the-essential", destination: "/shop/the-line", permanent: true },
      { source: "/shop/the-edition", destination: "/shop/the-wave", permanent: true },
      // Renamed Oct 2026: Velora → Wave, Ora → Flow, Nimbus → Line.
      { source: "/shop/the-velora", destination: "/shop/the-wave", permanent: true },
      { source: "/shop/the-ora", destination: "/shop/the-flow", permanent: true },
      { source: "/shop/the-nimbus", destination: "/shop/the-line", permanent: true },
    ];
  },
};

export default nextConfig;
