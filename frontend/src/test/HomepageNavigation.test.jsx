import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('framer-motion', () => ({
  motion: {
    a: ({ children, ...props }) => <a {...props}>{children}</a>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useScroll: () => ({ scrollYProgress: 0 }),
  useSpring: value => value,
}));

import Navbar from '../components/Navbar';

describe('homepage navigation', () => {
  it('keeps the homepage routes and section anchors', () => {
    render(<Navbar />);

    expect(screen.getAllByRole('link', { name: /home/i })[0]).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', { name: /events/i })[0]).toHaveAttribute('href', '/events');
    expect(screen.getAllByRole('link', { name: /^community$/i })[0]).toHaveAttribute('href', '/community');
    expect(screen.getAllByRole('link', { name: /^team$/i })[0]).toHaveAttribute('href', '/leadership');
    expect(screen.getAllByRole('link', { name: /about/i })[0]).toHaveAttribute('href', '/#about');
    expect(screen.getAllByRole('link', { name: /contact/i })[0]).toHaveAttribute('href', '/#contact');
  });

  it('keeps secondary public routes readable and sends the join action home', () => {
    render(<Navbar surface />);

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(navigation).toHaveClass('is-scrolled');
    expect(screen.getByRole('link', { name: /join now/i })).toHaveAttribute('href', '/#contact');
  });
});
