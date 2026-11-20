import type { NextConfig } from "next";

// next dev has no gateway in front, so it proxies /api itself
const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  // the Dockerfile copies .next/standalone
  output: "standalone",
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }
    return [{ source: "/api/:path*", destination: `${apiProxyTarget}/api/:path*` }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
