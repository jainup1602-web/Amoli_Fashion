/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  // Force all pages to be dynamic — prevents DYNAMIC_SERVER_USAGE errors on Vercel
  // since we use no-store fetches and request-time data throughout
  output: undefined,
  images: {
    domains: ['localhost', 'firebasestorage.googleapis.com', 'images.unsplash.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    formats: ['image/webp'],
    dangerouslyAllowSVG: true,
    unoptimized: true,
    minimumCacheTTL: 60,
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
    optimizePackageImports: ['lucide-react', '@reduxjs/toolkit', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
}

module.exports = nextConfig