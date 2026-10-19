export const THEME_STORAGE_KEY = 'ieee-theme';
export const THEME_QUERY = '(prefers-color-scheme: dark)';

export const isTheme = value => value === 'light' || value === 'dark';

export const getSystemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  try {
    return window.matchMedia(THEME_QUERY).matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const getStoredTheme = () => {
  if (typeof window === 'undefined') return null;

  try {
    const storedTheme = window.localStorage?.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
};

export const storeTheme = theme => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // A blocked or unavailable storage API should not disable the theme control.
  }
};

export const removeStoredTheme = () => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage?.removeItem(THEME_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
};

export const applyTheme = theme => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
};

export const subscribeToSystemTheme = onChange => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  let mediaQuery;

  try {
    mediaQuery = window.matchMedia(THEME_QUERY);
  } catch {
    return () => {};
  }

  const handleChange = event => onChange(event.matches ? 'dark' : 'light');

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }

  if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }

  return () => {};
};

let fallbackTheme = 'light';
let fallbackHasManualOverride = false;
let fallbackInitialized = false;
let fallbackSystemUnsubscribe;
const fallbackListeners = new Set();

const notifyFallbackListeners = () => {
  fallbackListeners.forEach(listener => listener());
};

const stopFallbackSystemSubscription = () => {
  fallbackSystemUnsubscribe?.();
  fallbackSystemUnsubscribe = undefined;
};

const startFallbackSystemSubscription = () => {
  if (fallbackHasManualOverride || fallbackSystemUnsubscribe) return;

  fallbackSystemUnsubscribe = subscribeToSystemTheme(theme => {
    if (fallbackHasManualOverride) return;
    fallbackTheme = theme;
    applyTheme(theme);
    notifyFallbackListeners();
  });
};

const initializeFallbackStore = () => {
  if (fallbackInitialized && fallbackListeners.size > 0) return;

  fallbackInitialized = true;
  const storedTheme = getStoredTheme();
  fallbackHasManualOverride = Boolean(storedTheme);
  fallbackTheme = storedTheme || getSystemTheme();
  applyTheme(fallbackTheme);
  startFallbackSystemSubscription();
};

export const fallbackThemeStore = {
  subscribe(listener) {
    const wasEmpty = fallbackListeners.size === 0;
    fallbackListeners.add(listener);
    if (wasEmpty) fallbackInitialized = false;
    initializeFallbackStore();

    return () => {
      fallbackListeners.delete(listener);
      if (fallbackListeners.size === 0) stopFallbackSystemSubscription();
    };
  },
  getSnapshot: () => fallbackTheme,
  getServerSnapshot: () => 'light',
  setTheme(theme) {
    if (!isTheme(theme)) return;

    fallbackInitialized = true;
    fallbackTheme = theme;
    fallbackHasManualOverride = true;
    storeTheme(theme);
    stopFallbackSystemSubscription();
    applyTheme(theme);
    notifyFallbackListeners();
  },
  clearOverride() {
    fallbackInitialized = true;
    fallbackHasManualOverride = false;
    removeStoredTheme();
    fallbackTheme = getSystemTheme();
    applyTheme(fallbackTheme);
    startFallbackSystemSubscription();
    notifyFallbackListeners();
  },
};
