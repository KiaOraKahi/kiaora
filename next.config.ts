import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "mwwrhk8wgc7jnjok.public.blob.vercel-storage.com",
      "lxzosqesvwftyg1v.public.blob.vercel-storage.com",
      "z4jzmpy08k3e4tez.public.blob.vercel-storage.com",
      "fvcgzborw1gqcgne.public.blob.vercel-storage.com",
      "https://fvcgzborw1gqcgne.public.blob.vercel-storage.com",
      "images.unsplash.com",
      "ui-avatars.com",
      "blob.vercel-storage.com",
      "lh3.googleusercontent.com",
    ],
  },
  // Configure API routes to handle large file uploads
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  // This will be handled by the API route configuration
};

export default nextConfig;
