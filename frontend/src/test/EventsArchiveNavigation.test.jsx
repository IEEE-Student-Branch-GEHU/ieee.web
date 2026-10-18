import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ArchiveNavbar from '../components/ArchiveNavbar';
import Footer from '../components/Footer';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

describe('events archive navigation', () => {
  it('keeps the home and contact navigation links', () => {
    render(<ArchiveNavbar />);

    expect(screen.getAllByRole('link', { name: /home/i })[0]).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /connect/i })).toHaveAttribute('href', '/#contact');
  });

  it('returns archive footer links to the homepage section anchors', () => {
    render(<Footer sectionLinkPrefix="/" />);
    expect(screen.getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/#events');
    expect(screen.getByRole('link', { name: 'Community' })).toHaveAttribute('href', '/community');
    expect(screen.getByRole('link', { name: 'Join Us' })).toHaveAttribute('href', '/#contact');
  });
});
