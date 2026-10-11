import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Hero from './Hero';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }) => <div className={className}>{children}</div>,
    img: ({ src, alt, className, ...props }) => <img src={src} alt={alt} className={className} />,
    h1: ({ children, className, ...props }) => <h1 className={className}>{children}</h1>,
    p: ({ children, className, ...props }) => <p className={className}>{children}</p>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock embla-carousel-autoplay — returns a plugin factory
vi.mock('embla-carousel-autoplay', () => ({
  default: () => ({}),
}));

// Mock Carousel UI components as simple pass-through containers
vi.mock('./ui/carousel', () => ({
  Carousel: ({ children, className, ...props }) => <div className={className} data-testid="carousel">{children}</div>,
  CarouselContent: ({ children, className }) => <div className={className} data-testid="carousel-content">{children}</div>,
  CarouselItem: ({ children, className }) => <div className={className} role="group" aria-roledescription="slide">{children}</div>,
}));

// Mock Button UI component as native button
vi.mock('./ui/button', () => ({
  Button: ({ children, className, size, variant, ...props }) => (
    <button className={className} {...props}>{children}</button>
  ),
}));

/**
 * Helper to render Hero wrapped in MemoryRouter
 * Required because Hero imports { Link } from 'react-router-dom'
 */
const renderHero = () => {
  return render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>
  );
};

describe('Hero Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders both CTA buttons', () => {
    renderHero();

    // CTAs repeat per slide (3 slides), so use getAllByText
    const memberButtons = screen.getAllByText('Become a Member');
    const eventsButtons = screen.getAllByText('Upcoming Events');

    expect(memberButtons.length).toBe(3);
    expect(eventsButtons.length).toBe(3);
  });

  it('renders the community tagline on every slide', () => {
    renderHero();

    // Tagline repeats on each slide
    const taglines = screen.getAllByText(
      'A community of innovators, researchers, and leaders at GEHU Dehradun.'
    );
    expect(taglines.length).toBe(3);
  });

  it('renders all carousel slide subheadings', () => {
    renderHero();

    expect(screen.getByText('Technical Events & Workshops')).toBeInTheDocument();
    expect(screen.getByText('Research & Innovation')).toBeInTheDocument();
    expect(screen.getByText('Community & Networking')).toBeInTheDocument();
  });

  it('renders carousel images with accessible alt text', () => {
    renderHero();

    expect(screen.getByAltText('carousel image 1')).toBeInTheDocument();
    expect(screen.getByAltText('carousel image 2')).toBeInTheDocument();
    expect(screen.getByAltText('carousel image 3')).toBeInTheDocument();
  });

  it('renders the carousel container', () => {
    renderHero();

    expect(screen.getByTestId('carousel')).toBeInTheDocument();
    expect(screen.getByTestId('carousel-content')).toBeInTheDocument();
  });

  it('renders exactly 3 slide groups', () => {
    renderHero();

    const slides = screen.getAllByRole('group');
    expect(slides).toHaveLength(3);
  });
});
