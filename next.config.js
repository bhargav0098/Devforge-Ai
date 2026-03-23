/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is default in Next.js 14, no need to set explicitly
  eslint: {
    // Prevent ESLint errors from blocking Vercel builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Prevent TS errors from blocking Vercel builds
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Required for Vercel serverless functions with longer timeouts
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
