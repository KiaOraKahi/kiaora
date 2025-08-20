import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* Remember to remove this type blockage */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "lxzosqesvwftyg1v.public.blob.vercel-storage.com",
      "images.unsplash.com",
      "via.placeholder.com",
      "picsum.photos",
      "placehold.co",
      "placehold.it",
      "dummyimage.com",
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
