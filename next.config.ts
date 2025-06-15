import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'quixotic-walrus-202.convex.cloud',
        port: '',
        pathname: '/api/storage/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
