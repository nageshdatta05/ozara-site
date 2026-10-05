import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Development only: lets the dev server work through temporary public tunnels.
  allowedDevOrigins: ["*.trycloudflare.com", "*.lhr.life"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 88, 90],
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
