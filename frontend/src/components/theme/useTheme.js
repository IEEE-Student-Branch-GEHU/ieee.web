import { useContext, useMemo, useSyncExternalStore } from 'react';
import { ThemeContext } from './theme-context';
import { fallbackThemeStore } from './theme-store';

const noopSubscribe = () => () => {};
const getLightSnapshot = () => 'light';

export function useTheme() {
  const context = useContext(ThemeContext);
  const fallbackTheme = useSyncExternalStore(
    context ? noopSubscribe : fallbackThemeStore.subscribe,
    context ? getLightSnapshot : fallbackThemeStore.getSnapshot,
    context ? getLightSnapshot : fallbackThemeStore.getServerSnapshot,
  );

  const fallbackValue = useMemo(() => ({
    theme: fallbackTheme,
    isDark: fallbackTheme === 'dark',
    hasManualOverride: false,
    setTheme: fallbackThemeStore.setTheme,
    toggleTheme: () => fallbackThemeStore.setTheme(fallbackTheme === 'dark' ? 'light' : 'dark'),
    clearThemeOverride: fallbackThemeStore.clearOverride,
  }), [fallbackTheme]);

  return context || fallbackValue;
}
