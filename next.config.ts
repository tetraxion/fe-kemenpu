import type { NextConfig } from "next";

// In production the gateway routes /api to the backend, so the browser always
// calls a same-origin, relative address. `next dev` has no gateway in front of
// it, so it proxies /api itself.
const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  // A self-contained server (.next/standalone) keeps the container image small.
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
