import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Navbar from '../components/Navbar';
import EventsArchive from '../pages/EventsArchive';
import Login from '../pages/admin/Login';

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, element) => ({ children, ...props }) => {
      const safeProps = Object.fromEntries(Object.entries(props).filter(([key]) => !['animate', 'initial', 'transition', 'whileHover', 'whileInView', 'whileTap', 'viewport', 'variants', 'exit'].includes(key)));
      return element === 'img' ? <img {...safeProps}>{children}</img> : (() => {
        const Element = element;
        return <Element {...safeProps}>{children}</Element>;
      })();
    },
  }),
  AnimatePresence: ({ children }) => <>{children}</>,
  useScroll: () => ({ scrollYProgress: 0 }),
  useSpring: value => value,
}));

vi.mock('../components/animations/Reveal', () => ({
  Reveal: ({ children }) => <>{children}</>,
}));

describe('theme coverage boundaries', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(() => new Promise(() => {}));
    window.scrollY = 0;
  });

  it('gives the mobile navigation control an accessible state and scoped theme hook', async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const menu = screen.getByRole('button', { name: 'Open navigation menu' });
    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveClass('site-nav-toggle');
    expect(menu.parentElement).toHaveClass('lg:hidden');
    expect(navigation.querySelector('[class~="lg:flex"]')).toBeInTheDocument();

    await user.click(menu);

    expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: 'Mobile navigation' })).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('dialog', { name: 'Mobile navigation' })).toHaveClass('site-mobile-menu');

    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute('aria-expanded', 'false');

    window.scrollY = 100;
    fireEvent.scroll(window);
    expect(navigation).toHaveClass('is-scrolled');
  });

  it('marks the archive surface and filter controls for light and dark tokens', () => {
    render(<EventsArchive />);

    expect(document.querySelector('.archive-page')).toHaveClass('site-surface');
    expect(document.querySelector('.archive-navbar-panel')).toBeInTheDocument();
    expect(document.querySelector('.archive-filter-panel')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search events by title' })).toHaveClass('archive-input');
  });

  it('marks the admin login card and fields as theme-aware surfaces', () => {
    render(<BrowserRouter><Login /></BrowserRouter>);

    expect(document.querySelector('.admin-login')).toHaveClass('site-surface');
    expect(document.querySelector('.admin-login-card')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('System Identifier')).toHaveClass('admin-input');
    expect(screen.getByPlaceholderText('••••••••••••')).toHaveClass('admin-input');
  });
});
