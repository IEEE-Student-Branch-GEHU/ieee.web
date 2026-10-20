import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Hero from '../components/Hero';

vi.mock('embla-carousel-autoplay', () => ({ default: () => ({}) }));
vi.mock('../components/ui/carousel', () => ({
  Carousel: ({ children }) => <div>{children}</div>,
  CarouselContent: ({ children }) => <div>{children}</div>,
  CarouselItem: ({ children }) => <div>{children}</div>,
}));
vi.mock('framer-motion', () => {
  const element = ({ children, src, alt, className }) => (
    src ? <img src={src} alt={alt} className={className} /> : <div className={className}>{children}</div>
  );
  return { motion: { div: element, h1: element, p: element, img: element } };
});

describe('Hero interactive markup', () => {
  it('renders one valid anchor per CTA without nesting a button inside a link', () => {
    const { container } = render(<Hero />);
    const memberLinks = screen.getAllByRole('link', { name: 'Become a Member' });
    const eventLinks = screen.getAllByRole('link', { name: 'Upcoming Events' });

    expect(memberLinks).toHaveLength(3);
    expect(eventLinks).toHaveLength(3);
    expect(memberLinks[0]).toHaveAttribute('href', '#contact');
    expect(eventLinks[0]).toHaveAttribute('href', '#events');
    expect(within(memberLinks[0]).queryByRole('button')).not.toBeInTheDocument();
    expect(within(eventLinks[0]).queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('[fdprocessedid]')).toBeNull();
  });
});
