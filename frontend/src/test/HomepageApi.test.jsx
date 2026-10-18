import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchHomepageJson, normalizeEventsResponse, normalizeTeamResponse } from '../lib/homepage-api';
import { ApiResponseError } from '../lib/http';

vi.mock('framer-motion', () => {
  const MotionElement = ({ children, ...props }) => <div {...props}>{children}</div>;

  return {
    motion: {
      div: MotionElement,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

vi.mock('../components/animations/Reveal', () => ({
  Reveal: ({ children }) => <div>{children}</div>,
}));

vi.mock('../config', () => ({
  default: '/api',
}));

import Contact from '../components/Contact';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('homepage API compatibility', () => {
  it('normalizes the backend events envelope into the homepage event list', () => {
    const response = {
      events: [{ _id: 'event-1', title: 'Backend Event' }],
      currentPage: 1,
      totalPages: 1,
      totalEvents: 1,
    };

    expect(normalizeEventsResponse(response)).toEqual(response.events);
  });

  it('accepts an empty or invalid events response without inventing data', () => {
    expect(normalizeEventsResponse({ events: [] })).toEqual([]);
    expect(normalizeEventsResponse({ message: 'Unavailable' })).toEqual([]);
  });

  it('reports the request when Next returns HTML instead of JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: { get: () => 'text/html; charset=utf-8' },
      text: async () => '<!DOCTYPE html><html><body>Not found</body></html>',
    }));

    await expect(fetchHomepageJson('/events')).rejects.toMatchObject({
      name: 'ApiResponseError',
      url: '/api/events',
      status: 404,
      message: 'Expected JSON from /api/events, but received text/html; charset=utf-8 (HTTP 404 Not Found).',
    });
    await expect(fetchHomepageJson('/events')).rejects.toBeInstanceOf(ApiResponseError);
  });

  it('maps nested team social fields without inventing unavailable model fields', () => {
    const [member] = normalizeTeamResponse([{
      _id: 'member-1',
      name: 'Real Member',
      role: 'Coordinator',
      category: 'faculty',
      socials: { linkedin: 'https://linkedin.example/member' },
    }]);

    expect(member.linkedin).toBe('https://linkedin.example/member');
    expect(member.bio).toBe('');
  });

  it('shows the backend message after a successful contact submission', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          message: 'Thank you for contacting IEEE GEHU.',
        }),
      }),
    );

    render(<Contact />);

    fireEvent.change(screen.getByPlaceholderText('John'), {
      target: { value: 'Ada', name: 'firstName' },
    });
    fireEvent.change(screen.getByPlaceholderText('Doe'), {
      target: { value: 'Lovelace', name: 'lastName' },
    });
    fireEvent.change(screen.getByPlaceholderText('john@ieee.org'), {
      target: { value: 'ada@example.com', name: 'email' },
    });
    fireEvent.change(screen.getByPlaceholderText('How can we help your innovation journey?'), {
      target: { value: 'Hello IEEE.', name: 'message' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /launch message/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText('Message Received.')).toBeInTheDocument();
      expect(screen.getByText('Thank you for contacting IEEE GEHU.')).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }));
  });

  it('shows the backend error message when contact submission fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Contact service unavailable.' }),
      }),
    );

    render(<Contact />);
    fireEvent.submit(screen.getByRole('button', { name: /launch message/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Contact service unavailable.');
    });
  });
});
