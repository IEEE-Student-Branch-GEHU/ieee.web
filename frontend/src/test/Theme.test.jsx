import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { act, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../components/theme/ThemeProvider';
import { ThemeToggle } from '../components/theme/ThemeToggle';

let systemTheme = 'light';
let mediaQueryList;
let hydratedRoot;
let hydrationContainer;

const configureSystemTheme = (theme) => {
  systemTheme = theme;
  const listeners = new Set();
  mediaQueryList = {
    get matches() {
      return systemTheme === 'dark';
    },
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_event, listener) => listeners.add(listener),
    removeEventListener: (_event, listener) => listeners.delete(listener),
    addListener: listener => listeners.add(listener),
    removeListener: listener => listeners.delete(listener),
  };

  window.matchMedia = vi.fn(() => mediaQueryList);

  return () => {
    listeners.forEach(listener => listener(mediaQueryList));
  };
};

const resetDocumentTheme = () => {
  document.documentElement.classList.remove('dark');
  delete document.documentElement.dataset.theme;
};

describe('theme controls', () => {
  beforeEach(() => {
    resetDocumentTheme();
    window.localStorage.clear();
    configureSystemTheme('light');
  });

  afterEach(() => {
    act(() => hydratedRoot?.unmount());
    hydratedRoot = undefined;
    hydrationContainer?.remove();
    hydrationContainer = undefined;
    vi.restoreAllMocks();
  });

  it('keeps server markup deterministic and applies the system theme after hydration', async () => {
    configureSystemTheme('dark');
    const serverMarkup = renderToString(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(serverMarkup).toContain('aria-label="Switch to dark mode"');
    expect(serverMarkup).toContain('aria-pressed="false"');

    const container = document.createElement('div');
    hydrationContainer = container;
    container.innerHTML = serverMarkup;
    document.body.appendChild(container);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const onRecoverableError = vi.fn();
    await act(async () => {
      hydratedRoot = hydrateRoot(
        container,
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>,
        { onRecoverableError },
      );
    });

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
      expect(screen.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    expect(consoleError).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
  });

  it('persists a manual choice and ignores later system changes', async () => {
    const followSystem = configureSystemTheme('dark');
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));

    expect(document.documentElement).not.toHaveClass('dark');
    expect(window.localStorage.getItem('ieee-theme')).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    systemTheme = 'dark';
    act(followSystem);
    await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'));
  });

  it('uses the system preference without throwing when storage is unavailable', async () => {
    configureSystemTheme('dark');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage denied');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage denied');
    });

    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));

    expect(document.documentElement).not.toHaveClass('dark');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('remains usable when rendered without a provider', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const toggle = screen.getByRole('button', { name: 'Switch to dark mode' });

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    toggle.focus();
    expect(toggle).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(document.documentElement).toHaveClass('dark');
  });

  it('follows system changes after standalone navigation is unmounted and mounted again', async () => {
    const followSystem = configureSystemTheme('light');
    const firstNavigation = render(<ThemeToggle />);
    firstNavigation.unmount();
    render(<ThemeToggle />);

    systemTheme = 'dark';
    act(followSystem);

    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('ieee-theme')).toBeNull();
  });

  it('keeps multiple standalone toggles in sync', async () => {
    const user = userEvent.setup();
    render(<><ThemeToggle /><ThemeToggle /></>);
    await user.click(screen.getAllByRole('button', { name: 'Switch to dark mode' })[0]);

    expect(screen.getAllByRole('button', { name: 'Switch to light mode' })).toHaveLength(2);
    expect(document.documentElement).toHaveClass('dark');
  });

  it('uses a stored light override even when the system prefers dark', () => {
    configureSystemTheme('dark');
    localStorage.setItem('ieee-theme', 'light');
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('follows live system changes without persisting an automatic preference', () => {
    const followSystem = configureSystemTheme('light');
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    systemTheme = 'dark';
    act(followSystem);

    expect(document.documentElement).toHaveClass('dark');
    systemTheme = 'light';
    act(followSystem);
    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('ieee-theme')).toBeNull();
  });
});
