/* global process */
import { normalizeApiBaseUrl } from './lib/deployment-config';

// Next replaces this direct public variable reference at build time.
const nextApiUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
const viteApiUrl = import.meta.env?.VITE_API_URL;
const nextDevelopmentApiUrl = typeof process !== 'undefined'
    && process.env.NODE_ENV === 'development'
    && typeof window !== 'undefined'
    && !viteApiUrl
    ? 'http://127.0.0.1:5000/api'
    : undefined;

const API_BASE_URL = normalizeApiBaseUrl(viteApiUrl || nextApiUrl || nextDevelopmentApiUrl);
export default API_BASE_URL;
