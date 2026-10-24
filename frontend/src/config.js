/* global process */
import { resolveApiBaseUrl } from './lib/deployment-config';

// Next replaces this direct public variable reference at build time.
const nextApiUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
const viteApiUrl = import.meta.env?.VITE_API_URL;
const isViteDev = import.meta.env?.MODE === 'development' && typeof window !== 'undefined';

const API_BASE_URL = resolveApiBaseUrl({ nextApiUrl, viteApiUrl, isViteDev });
export default API_BASE_URL;
