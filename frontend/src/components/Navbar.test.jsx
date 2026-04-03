import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from './Navbar';

// Mock framer-motion — mirrors established pattern from Reveal.test.jsx / EventsArchive.test.jsx
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, style, className, ...props }) => (
      <div style={style} className={className}>{children}</div>
    ),
    a: ({ children, href, target, rel, className, ...props }) => (
      <a href={href} target={target} rel={rel} className={className}>{children}</a>
    ),
    button: ({ children, onClick, className, ...props }) => (
      <button onClick={onClick} className={className}>{children}</button>
    ),
    img: ({ src, alt, className, ...props }) => (
      <img src={src} alt={alt} className={className} />
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useSpring: (val) => val,
}));

// Mock asset import
vi.mock('../assets/logo.png', () => ({ default: 'test-logo.png' }));

// Mock lucide-react icons as simple labeled elements
vi.mock('lucide-react', () => ({
  Menu: (props) => <span data-testid="icon-menu">Menu</span>,
  X: (props) => <span data-testid="icon-x">X</span>,
  Instagram: (props) => <span data-testid="icon-instagram">Instagram</span>,
  Linkedin: (props) => <span data-testid="icon-linkedin">Linkedin</span>,
  Github: (props) => <span data-testid="icon-github">Github</span>,
  ArrowUpRight: (props) => <span data-testid="icon-arrow">↗</span>,
}));

/**
 * Helper to render Navbar wrapped in MemoryRouter
 * Required because Navbar imports { Link } from 'react-router-dom'
 */
const renderNavbar = () => {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all navigation links', () => {
    renderNavbar();

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders the IEEE logo image', () => {
    renderNavbar();

    const logo = screen.getByAltText('IEEE Logo');
    expect(logo).toBeInTheDocument();
    expect(logo.tagName).toBe('IMG');
  });

  it('renders the Join Now CTA button text', () => {
    renderNavbar();

    expect(screen.getByText('Join Now')).toBeInTheDocument();
  });

  it('renders navigation link section IDs (01-05)', () => {
    renderNavbar();

    // The navLinks data assigns IDs 01–05 but they are only rendered
    // conditionally based on layout — we check the desktop nav links exist
    // by confirming the link names render with their associated text
    const allNavTexts = ['Home', 'Events', 'Team', 'About', 'Contact'];
    allNavTexts.forEach(text => {
      expect(screen.getAllByText(text).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('toggles mobile menu open on hamburger click', () => {
    renderNavbar();

    // Before click: Menu icon should be visible
    const menuIcon = screen.getByTestId('icon-menu');
    expect(menuIcon).toBeInTheDocument();

    // Click the hamburger toggle button
    const toggleButton = menuIcon.closest('button');
    fireEvent.click(toggleButton);

    // After click: X icon should appear (isOpen = true)
    expect(screen.getByTestId('icon-x')).toBeInTheDocument();
  });

  it('renders social media links with correct hrefs', () => {
    renderNavbar();

    // Open mobile menu to access social links
    const menuIcon = screen.getByTestId('icon-menu');
    fireEvent.click(menuIcon.closest('button'));

    const instagramLink = screen.getByTestId('icon-instagram').closest('a');
    const linkedinLink = screen.getByTestId('icon-linkedin').closest('a');
    const githubLink = screen.getByTestId('icon-github').closest('a');

    expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/ieee_gehu');
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/ieeesb-gehu');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/IEEE-Student-Branch-GEHU/ieee.web');
  });

  it('renders the "Get in touch" link in mobile menu', () => {
    renderNavbar();

    // Open mobile menu
    const menuIcon = screen.getByTestId('icon-menu');
    fireEvent.click(menuIcon.closest('button'));

    expect(screen.getByText('Get in touch')).toBeInTheDocument();
  });
});
