'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './useTheme';

export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  const nextTheme = isDark ? 'light' : 'dark';
  const label = `Switch to ${nextTheme} mode`;

  return (
    <button
      type="button"
      className={`theme-toggle inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${className}`}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      onClick={toggleTheme}
    >
      {isDark ? <Sun aria-hidden="true" size={18} strokeWidth={2.25} /> : <Moon aria-hidden="true" size={18} strokeWidth={2.25} />}
    </button>
  );
}

export default ThemeToggle;
