import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Gunakan turbopack (default di Next.js 16)
  turbopack: {},
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
