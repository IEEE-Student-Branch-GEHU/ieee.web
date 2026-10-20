/* global process */

// Public OAuth client ID for Google Identity Services. Next replaces this
// direct public variable reference at build time.
const nextClientId = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID : undefined;
const viteClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

export const GOOGLE_CLIENT_ID = (nextClientId || viteClientId || '').trim() || null;

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';
let scriptPromise = null;

// Loads Google's sign-in script once, only on pages that show the button.
export const loadGoogleIdentity = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Google sign-in needs a browser'));
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);

  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.onload = () => (window.google?.accounts?.id
      ? resolve(window.google.accounts.id)
      : reject(new Error('Google sign-in did not load')));
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error('Google sign-in could not be loaded'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
};
