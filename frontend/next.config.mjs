import { validateNextBuildEnvironment } from './src/lib/deployment-config.js';

validateNextBuildEnvironment({
  isVercel: process.env.VERCEL === '1',
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  publicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // next.jsx: App Router pages. next.js: the API route that mounts server/.
  pageExtensions: ['next.jsx', 'next.js'],
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  // Node-only server dependencies are required at runtime instead of bundled.
  serverExternalPackages: [
    'bcryptjs',
    'cloudinary',
    'express',
    'express-mongo-sanitize',
    'express-rate-limit',
    'google-auth-library',
    'jsonwebtoken',
    'mongoose',
    'multer',
    'multer-storage-cloudinary',
  ],
  async rewrites() {
    return [{ source: '/health', destination: '/api/health' }];
  },
};

export default nextConfig;
