import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  transpilePackages: ['@lobehub/icons'],
};

export default nextConfig;
