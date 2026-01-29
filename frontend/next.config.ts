import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Environment variables for production
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  images: {
    unoptimized: true, // Required for many Vercel/Static deployments
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shorturl.at',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
    ],
  },

  // Transpile packages for blockchain/web3 stability
  transpilePackages: [
    '@rainbow-me/rainbowkit',
    'wagmi',
    'viem',
    '@tanstack/react-query',
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  poweredByHeader: false,
  compress: true,
};

export default nextConfig;