'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  isTheme,
  removeStoredTheme,
  storeTheme,
  subscribeToSystemTheme,
} from './theme-store';
import { ThemeContext } from './theme-context';

export function ThemeProvider({ children }) {
  // Keep the first server and client render identical. Browser preferences are
  // read in an effect and applied immediately after hydration.
  const [theme, setThemeState] = useState('light');
  const [hasManualOverride, setHasManualOverride] = useState(false);

  useEffect(() => {
    const storedTheme = getStoredTheme();
    const initialTheme = storedTheme || getSystemTheme();

    // Preference resolution happens after hydration to keep server and client
    // markup deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initialTheme);
    setHasManualOverride(Boolean(storedTheme));
    applyTheme(initialTheme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (hasManualOverride) return undefined;

    return subscribeToSystemTheme(setThemeState);
  }, [hasManualOverride]);

  const setTheme = useCallback(nextTheme => {
    if (!isTheme(nextTheme)) return;

    setThemeState(nextTheme);
    setHasManualOverride(true);
    storeTheme(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [setTheme, theme]);

  const clearThemeOverride = useCallback(() => {
    removeStoredTheme();
    setHasManualOverride(false);
    setThemeState(getSystemTheme());
  }, []);

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    hasManualOverride,
    setTheme,
    toggleTheme,
    clearThemeOverride,
  }), [clearThemeOverride, hasManualOverride, setTheme, theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;
