import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* Remember to remove this type blockage */
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
