import { validateNextBuildEnvironment } from './src/lib/deployment-config.js';

validateNextBuildEnvironment({
  isVercel: process.env.VERCEL === '1',
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  publicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['next.jsx'],
  reactStrictMode: true,
};

export default nextConfig;
