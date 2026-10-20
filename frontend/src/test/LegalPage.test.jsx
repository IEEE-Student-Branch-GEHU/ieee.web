import { render, screen, within } from '@testing-library/react';
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

vi.mock('../components/Navbar', () => ({
  default: () => <nav aria-label="Primary navigation" />,
}));

import LegalPage from '../components/legal/LegalPage';
import Footer from '../components/Footer';
import { legalContent } from '../components/legal/legal-content';
import { metadata as privacyMetadata } from '../app/privacy/page.next';
import { metadata as termsMetadata } from '../app/terms/page.next';

const legalCopy = JSON.stringify(legalContent);

describe('LegalPage', () => {
  it('sets draft document metadata without enabling indexing', () => {
    render(<LegalPage />);

    expect(document.title).toBe('Privacy Policy');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');

    render(<LegalPage kind="terms" />);

    expect(document.title).toBe('Terms and Conditions');
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  });

  it('exports exact Next.js titles and draft robots directives', () => {
    expect(privacyMetadata.title).toBe('Privacy Policy');
    expect(privacyMetadata.robots).toEqual({ index: false, follow: false });
    expect(termsMetadata.title).toBe('Terms and Conditions');
    expect(termsMetadata.robots).toEqual({ index: false, follow: false });
  });

  it('renders the privacy policy by default without depending on a router', () => {
    render(<LegalPage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByText('Draft: awaiting organizer and legal review')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Data controller and ownership' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Retention' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Requests and review status' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveClass('site-surface');
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('site-text');
  });

  it('renders the terms and conditions from its kind prop', () => {
    render(<LegalPage kind="terms" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Terms and Conditions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Acceptable use' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Unresolved terms for review' })).toBeInTheDocument();
    expect(screen.getByText('Draft: awaiting organizer and legal review')).toBeInTheDocument();
  });

  it('renders the general enquiry mailto link and keeps section ids unique', () => {
    render(<LegalPage />);

    const privacyMain = screen.getByRole('main');
    expect(within(privacyMain).getByRole('link', { name: 'ieee@gehu.ac.in' })).toHaveAttribute('href', 'mailto:ieee@gehu.ac.in');

    const ids = [...privacyMain.querySelectorAll('[id]')].map(element => element.id);
    expect(new Set(ids).size).toBe(ids.length);

    render(<LegalPage kind="terms" />);
    const termsMain = screen.getAllByRole('main').at(-1);
    const sectionLabels = [...termsMain.querySelectorAll('section[aria-labelledby]')].map(section => section.getAttribute('aria-labelledby'));
    expect(new Set(sectionLabels).size).toBe(sectionLabels.length);
    expect(termsMain.querySelector('#terms-contact-heading')).toBeInTheDocument();
    expect(termsMain.querySelector('#terms-contact-review-heading')).toBeInTheDocument();
  });

  it('records current implementation facts and avoids unapproved legal claims', () => {
    expect(legalCopy).toContain('/api/contact');
    expect(legalCopy).toContain('submitted request details');
    expect(legalCopy).toContain('does not send an email');
    expect(legalCopy).not.toContain('req.body');
    expect(legalCopy).toContain('adminToken');
    expect(legalCopy).toContain('ieee-theme');
    expect(legalCopy).toContain('prefers-color-scheme');
    expect(legalCopy).toContain('No analytics SDK');
    expect(legalCopy).toContain('public profile QR code encodes the URL');
    expect(legalCopy).toContain('bcrypt');
    expect(legalCopy).toContain('JSON Web Token');
    expect(legalCopy).toContain('JWT');
    expect(legalCopy).toContain('rate limiting');
    expect(legalCopy).toContain('no absolute security guarantee');
    expect(legalCopy).toContain('Authorized administrators manage public profiles and events');
    expect(legalCopy).toContain('personal email or phone fields');
    expect(legalCopy).toContain('Cloudinary');
    expect(legalCopy).toContain('MongoDB');
    expect(legalCopy).toContain('fonts.googleapis.com');
    expect(legalCopy).toContain('grainy-gradients.vercel.app/noise.svg');
    expect(legalCopy).toContain('Unsplash');
    expect(legalCopy).toContain('Vercel');
    expect(legalCopy).not.toContain('Render');
    expect(legalCopy).toContain('Do not attempt unauthorized access');
    expect(legalCopy).toContain('Submissions should be accurate');
    expect(legalCopy).toContain('Nothing on this website grants an implied trademark license');
    expect(legalCopy).toContain('External destinations and providers may have their own content, privacy, security, and use policies');
    expect(legalCopy).not.toContain('Privacy Notice');
    expect(legalCopy).not.toContain('Terms of Use');
    expect(legalCopy).not.toMatch(/\u2014/);
    expect(legalCopy).not.toMatch(/\b(?:GDPR|CCPA|HIPAA|SOC 2|ISO 27001)\b/i);
    expect(legalCopy).not.toMatch(/\b(?:30 days|90 days|one year|seven years|retained for)\b/i);
    expect(legalCopy).not.toMatch(/governing law\s*:/i);
    expect(legalCopy).not.toMatch(/\b(?:certified|certification|registered legal entity)\b/i);
  });
});

describe('Footer legal links', () => {
  it('exposes one accessible link for each planned legal route', () => {
    render(<Footer />);

    const privacyLinks = screen.getAllByRole('link', { name: 'Privacy Policy' });
    const termsLinks = screen.getAllByRole('link', { name: 'Terms and Conditions' });

    expect(privacyLinks).toHaveLength(1);
    expect(privacyLinks[0]).toHaveAttribute('href', '/privacy');
    expect(termsLinks).toHaveLength(1);
    expect(termsLinks[0]).toHaveAttribute('href', '/terms');
  });
});
