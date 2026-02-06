import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable turbopack temporarily to fix panic error
  // turbopack: {},
  // Optimisasi untuk menghindari hydration errors
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Konfigurasi untuk caching dan revalidation
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
