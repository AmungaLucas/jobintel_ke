import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" removed — Vercel handles output format automatically
  // Keeping it causes JWT decryption issues with next-auth on Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
