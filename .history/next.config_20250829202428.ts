import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "lxzosqesvwftyg1v.public.blob.vercel-storage.com", 
      "z4jzmpy08k3e4tez.public.blob.vercel-storage.com",
      "images.unsplash.com",
      "blob.vercel-storage.com",
      "lh3.googleusercontent.com"
    ],
  },
};

export default nextConfig;
