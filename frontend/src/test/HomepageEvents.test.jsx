import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config', () => ({
  default: '/api',
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

vi.mock('../components/animations/Reveal', () => ({
  Reveal: ({ children }) => <div>{children}</div>,
}));

vi.mock('../components/ui/carousel', () => ({
  Carousel: ({ children }) => <div>{children}</div>,
  CarouselContent: ({ children }) => <div>{children}</div>,
  CarouselItem: ({ children }) => <div>{children}</div>,
  CarouselNext: () => null,
  CarouselPrevious: () => null,
}));

import Events from '../components/Events';

describe('homepage events section', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('renders events from the backend paginated response', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        events: [{
          _id: 'event-1',
          title: 'Backend Workshop',
          date: '2026-01-15',
          category: 'Workshop',
          description: 'A real backend event.',
        }],
        currentPage: 1,
        totalPages: 1,
        totalEvents: 1,
      }),
    });

    render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Backend Workshop')).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith('/api/events?limit=12&onLandingPage=true', expect.any(Object));
  });

  it('shows an API error instead of placeholder event data', async () => {
    fetch.mockRejectedValue(new Error('Backend unavailable'));

    render(<Events />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Unable to load events right now.');
    });
    expect(screen.queryByText('Placeholder Event')).not.toBeInTheDocument();
  });
});
