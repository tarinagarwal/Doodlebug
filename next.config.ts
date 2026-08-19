import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["mongoose"],
  // /api/og reads the TrueType fonts and the preview artwork from disk at request time.
  // Nothing imports those files, so the tracer leaves them out of the lambda and the route
  // 500s in production while working locally. Name them explicitly.
  outputFileTracingIncludes: {
    "/api/og": ["./src/fonts/ttf/**/*", "./public/og/**/*"],
  },
  async headers() {
    return [
      {
        source: "/api/card/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
