import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* Remember to remove this type blockage */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["lxzosqesvwftyg1v.public.blob.vercel-storage.com"],
  },
};

export default nextConfig;
