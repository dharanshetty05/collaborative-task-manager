import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,

  async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "https://taskflow-backend-w8ce.onrender.com/api/:path*"
        },
      ];
  },
};

export default nextConfig;
