import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './dialog-support';
import EventsArchive from '../pages/EventsArchive';
import Events from '../components/Events';

vi.mock('../config', () => ({ default: '/api' }));
vi.mock('framer-motion', () => ({
  motion: { div: ({ children, className }) => <div className={className}>{children}</div> },
  AnimatePresence: ({ children }) => children,
  useReducedMotion: () => true,
}));
vi.mock('../components/animations/Reveal', () => ({ Reveal: ({ children }) => children }));
vi.mock('../components/ArchiveNavbar', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/ui/carousel', () => ({
  Carousel: ({ children }) => <div>{children}</div>,
  CarouselContent: ({ children }) => <div>{children}</div>,
  CarouselItem: ({ children }) => <div>{children}</div>,
  CarouselNext: () => null, CarouselPrevious: () => null,
}));

const first = { _id: 'first', title: 'Workshop', date: '2026-01-01', image: 'https://example.invalid/cover.jpg', highlights: [
  { url: 'https://example.invalid/one.jpg', caption: 'Opening session' },
  { url: 'https://example.invalid/two.jpg', caption: 'Hands-on lab' },
] };
const second = { _id: 'second', title: 'Seminar', date: '2026-01-02', highlights: [{ url: 'https://example.invalid/other.jpg' }] };
const respondWith = (events) => fetch.mockResolvedValue({ ok: true, json: async () => ({ events, totalPages: 1 }) });

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  respondWith([first, second]);
});
afterEach(() => vi.unstubAllGlobals());

describe.each([['archive', EventsArchive], ['homepage', Events]])('%s highlights', (_, Component) => {
  const Page = Component;
  it('opens the selected event, cycles slides/counter, closes, and opens another gallery afresh', async () => {
    const user = userEvent.setup();
    render(<Page />);
    const triggers = await screen.findAllByRole('button', { name: /view highlights/i });
    await user.click(triggers[0]);
    const dialog = screen.getByRole('dialog', { name: 'Workshop highlights' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', first.highlights[0].url);
    expect(within(dialog).getByRole('img')).toHaveAccessibleName(/Workshop.*Opening session/);
    expect(within(dialog).getByText('Photo 1 of 2')).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');
    expect(within(dialog).getByRole('button', { name: 'Close highlights' })).toHaveFocus();
    await user.click(within(dialog).getByRole('button', { name: 'Next photo' }));
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', first.highlights[1].url);
    expect(within(dialog).getByText('Photo 2 of 2')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Next photo' }));
    expect(within(dialog).getByText('Photo 1 of 2')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Previous photo' }));
    expect(within(dialog).getByText('Photo 2 of 2')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Close highlights' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    expect(triggers[0]).toHaveFocus();

    await user.click(triggers[1]);
    const other = screen.getByRole('dialog', { name: 'Seminar highlights' });
    expect(within(other).getByRole('img')).toHaveAttribute('src', second.highlights[0].url);
    expect(within(other).getByText('Photo 1 of 1')).toBeInTheDocument();
    expect(within(other).getByRole('button', { name: 'Next photo' })).toBeDisabled();
  });

  it('supports arrow keys and Escape, without navigating away', async () => {
    const user = userEvent.setup();
    render(<Page />);
    const trigger = (await screen.findAllByRole('button', { name: /view highlights/i }))[0];
    const location = window.location.href;
    await user.click(trigger);
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Photo 2 of 2')).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText('Photo 1 of 2')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.location.href).toBe(location);
    expect(trigger).toHaveFocus();
  });

  it.each([undefined, null, {}, 'bad', [null, { url: { $ne: null } }, { url: 'javascript:alert(1)' }], []])('handles missing/malformed galleries with an explicit empty state (case %#)', async (highlights) => {
    respondWith([{ ...first, highlights }]);
    render(<Page />);
    fireEvent.click(await screen.findByRole('button', { name: /view highlights/i }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('No highlights available for this event yet.')).toBeInTheDocument();
    expect(within(dialog).queryByRole('img')).not.toBeInTheDocument();
  });

  it('closes only when a backdrop click starts and ends outside the content', async () => {
    render(<Page />);
    fireEvent.click((await screen.findAllByRole('button', { name: /view highlights/i }))[0]);
    const dialog = screen.getByRole('dialog');
    const image = within(dialog).getByRole('img');
    fireEvent(image, new MouseEvent('pointerdown', { bubbles: true }));
    fireEvent.click(dialog, { clientX: -10, clientY: -10 });
    expect(dialog).toBeInTheDocument();
    fireEvent(dialog, new MouseEvent('pointerdown', { bubbles: true, clientX: -10, clientY: -10 }));
    fireEvent.click(dialog, { clientX: -10, clientY: -10 });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('handles a failed image without substituting unrelated photos', async () => {
    render(<Page />);
    fireEvent.click((await screen.findAllByRole('button', { name: /view highlights/i }))[0]);
    const dialog = screen.getByRole('dialog');
    fireEvent.error(within(dialog).getByRole('img'));
    expect(within(dialog).getByText('This photo could not be loaded.')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Next photo' }));
    expect(within(dialog).getByRole('img')).toHaveAttribute('src', first.highlights[1].url);
  });
});
