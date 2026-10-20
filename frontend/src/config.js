/* global process */
import { normalizeApiBaseUrl } from './lib/deployment-config';

// The API is served by this Next.js app at /api. NEXT_PUBLIC_API_URL is only
// needed to point the site at a separately hosted API.
// Next replaces this direct public variable reference at build time.
const nextApiUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
const viteApiUrl = import.meta.env?.VITE_API_URL;

const API_BASE_URL = normalizeApiBaseUrl(nextApiUrl || viteApiUrl);
export default API_BASE_URL;
