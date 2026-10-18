import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TeamsArchive from '../components/members/TeamsArchive';
import YearSelector from '../components/members/YearSelector';

const { fetchJson } = vi.hoisted(() => ({ fetchJson: vi.fn() }));

vi.mock('../config', () => ({ default: '/api' }));
vi.mock('../lib/http', () => ({ fetchJson }));
vi.mock('../components/Navbar', () => ({ default: () => <nav aria-label="Primary navigation">Navbar</nav> }));
vi.mock('../components/Footer', () => ({ default: () => <footer>Footer</footer> }));

const years = ['2025-2026', '2024-2025'];
const members = {
  latest: [
    { _id: '507f1f77bcf86cd799439011', name: 'Ada Lovelace', role: 'Chairperson', category: 'executive', year: '2025-2026' },
    { _id: '507f1f77bcf86cd799439012', name: 'Grace Hopper', role: 'Secretary', category: 'technical', year: '2025-2026', bio: 'Compiler pioneer' },
  ],
  previous: [
    { _id: '507f1f77bcf86cd799439013', name: 'Katherine & Johnson', role: 'Chairperson', category: 'executive', year: '2024-2025' },
  ],
  legacy: [
    { _id: '507f1f77bcf86cd799439014', name: 'Legacy Member', role: 'Member', category: 'executive', bio: 'A record without a year' },
  ],
};

const responseFor = (value) => Promise.resolve(value);

describe('YearSelector', () => {
  it('changes the selected year with arrow keys', () => {
    const onChange = vi.fn();
    render(<YearSelector years={years} value="all" onChange={onChange} />);

    const selector = screen.getByRole('combobox', { name: /team year/i });
    selector.focus();
    fireEvent.keyDown(selector, { key: 'ArrowDown' });

    expect(onChange).toHaveBeenCalledWith('2025-2026');
  });
});

describe('TeamsArchive', () => {
  beforeEach(() => {
    fetchJson.mockReset();
    window.history.replaceState({}, '', '/teams');
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/teams');
  });

  it('selects the latest available year by default', async () => {
    fetchJson.mockImplementation((url) => {
      if (url === '/api/team/years') return responseFor(years);
      if (url === '/api/team?year=2025-2026') return responseFor(members.latest);
      throw new Error(`Unexpected request: ${url}`);
    });

    render(<TeamsArchive />);

    expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /team year/i })).toHaveValue('2025-2026');
    expect(screen.getByRole('link', { name: 'Ada Lovelace' })).toHaveAttribute('href', '/members/507f1f77bcf86cd799439011');
    expect(screen.getByRole('img', { name: 'Ada Lovelace profile image unavailable' })).toHaveTextContent('AL');
    expect(fetchJson).toHaveBeenCalledWith('/api/team/years', expect.any(Object));
    expect(fetchJson).toHaveBeenCalledWith('/api/team?year=2025-2026', expect.any(Object));
  });

  it('updates shareable query parameters for year and search', async () => {
    fetchJson.mockImplementation((url) => {
      if (url === '/api/team/years') return responseFor(years);
      if (url === '/api/team?year=2025-2026') return responseFor(members.latest);
      if (url === '/api/team?year=2024-2025') return responseFor(members.previous);
      throw new Error(`Unexpected request: ${url}`);
    });

    render(<TeamsArchive />);
    await screen.findByRole('heading', { name: 'Ada Lovelace' });

    fireEvent.change(screen.getByRole('combobox', { name: /team year/i }), { target: { value: '2024-2025' } });
    fireEvent.change(screen.getByRole('searchbox', { name: /search team members/i }), { target: { value: 'Katherine & Johnson' } });

    await screen.findByRole('heading', { name: 'Katherine & Johnson' });
    expect(new URLSearchParams(window.location.search).get('year')).toBe('2024-2025');
    expect(new URLSearchParams(window.location.search).get('search')).toBe('Katherine & Johnson');
    expect(window.location.search).toContain('Katherine+%26+Johnson');
  });

  it('searches only the members loaded for the selected year', async () => {
    fetchJson.mockImplementation((url) => {
      if (url === '/api/team/years') return responseFor(years);
      if (url === '/api/team?year=2025-2026') return responseFor(members.latest);
      throw new Error(`Unexpected request: ${url}`);
    });

    render(<TeamsArchive />);
    await screen.findByRole('heading', { name: 'Ada Lovelace' });

    fireEvent.change(screen.getByRole('searchbox', { name: /search team members/i }), { target: { value: 'grace' } });

    expect(screen.getByRole('heading', { name: 'Grace Hopper' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ada Lovelace' })).not.toBeInTheDocument();
  });

  it('uses all years when the years endpoint has no entries and keeps undated records', async () => {
    fetchJson.mockImplementation((url) => {
      if (url === '/api/team/years') return responseFor([]);
      if (url === '/api/team') return responseFor(members.legacy);
      throw new Error(`Unexpected request: ${url}`);
    });

    render(<TeamsArchive />);

    expect(await screen.findByRole('heading', { name: 'Legacy Member' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /team year/i })).toHaveValue('all');
    expect(screen.getByRole('option', { name: /including undated/i })).toBeInTheDocument();
    expect(fetchJson).toHaveBeenCalledWith('/api/team', expect.any(Object));
  });

  it('shows a retry action when the years request fails', async () => {
    let yearsAttempts = 0;
    fetchJson.mockImplementation((url) => {
      if (url === '/api/team/years') {
        yearsAttempts += 1;
        return yearsAttempts === 1 ? Promise.reject(new Error('Network error')) : responseFor(years);
      }
      if (url === '/api/team?year=2025-2026') return responseFor(members.latest);
      throw new Error(`Unexpected request: ${url}`);
    });

    render(<TeamsArchive />);

    expect(await screen.findByRole('heading', { name: 'Team archive unavailable' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
  });

  it('shows a retry action when the selected listing fails', async () => {
    let listingAttempts = 0;
    fetchJson.mockImplementation((url) => {
      if (url === '/api/team/years') return responseFor(years);
      if (url === '/api/team?year=2025-2026') {
        listingAttempts += 1;
        return listingAttempts === 1 ? Promise.reject(new Error('Network error')) : responseFor(members.latest);
      }
      throw new Error(`Unexpected request: ${url}`);
    });

    render(<TeamsArchive />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to load team members/i);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(await screen.findByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
  });

  it('applies a browser popstate change to the selected year and search', async () => {
    fetchJson.mockImplementation((url) => {
      if (url === '/api/team/years') return responseFor(years);
      if (url === '/api/team?year=2025-2026') return responseFor(members.latest);
      if (url === '/api/team?year=2024-2025') return responseFor(members.previous);
      throw new Error(`Unexpected request: ${url}`);
    });

    render(<TeamsArchive />);
    await screen.findByRole('heading', { name: 'Ada Lovelace' });

    window.history.pushState({}, '', '/teams?year=2024-2025&search=Katherine');
    window.dispatchEvent(new PopStateEvent('popstate'));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Katherine & Johnson' })).toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: /team year/i })).toHaveValue('2024-2025');
    expect(screen.getByRole('searchbox', { name: /search team members/i })).toHaveValue('Katherine');
  });
});
