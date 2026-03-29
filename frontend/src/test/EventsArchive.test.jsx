import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EventsArchive from '../pages/EventsArchive';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  useInView: () => true,
}));

// Mock Reveal component
vi.mock('../components/animations/Reveal', () => ({
  Reveal: ({ children }) => <div>{children}</div>,
}));

// Mock Navbar and Footer
vi.mock('../components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

const mockEvents = [
  {
    id: 1,
    title: 'React Workshop',
    description: 'Learn React basics',
    category: 'Workshops',
    date: '2024-04-15',
    image: 'https://via.placeholder.com/400x300',
  },
  {
    id: 2,
    title: 'AI Seminar',
    description: 'Explore AI and Machine Learning',
    category: 'Seminars',
    date: '2024-05-20',
    image: 'https://via.placeholder.com/400x300',
  },
  {
    id: 3,
    title: 'Coding Competition',
    description: 'Compete and win prizes',
    category: 'Competitions',
    date: '2024-06-10',
    image: 'https://via.placeholder.com/400x300',
  },
];

describe('EventsArchive Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the page with header and layout', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockEvents),
      })
    );

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    expect(screen.getByText('EVENTS ARCHIVE')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Explore the complete history of IEEE GEHU events/i
      )
    ).toBeInTheDocument();
  });

  it('fetches and displays events on mount', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockEvents),
      })
    );

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
      expect(screen.getByText('AI Seminar')).toBeInTheDocument();
      expect(screen.getByText('Coding Competition')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/events?page=1&limit=12');
  });

  it('displays loading spinner while fetching', () => {
    global.fetch = vi.fn(
      () =>
        new Promise(() => {
          // Never resolves, keeps loading
        })
    );

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    // Check for the loading spinner div
    const spinnerDivs = screen.getAllByRole('generic');
    const hasSpinner = spinnerDivs.some(el => 
      el.className.includes('animate-spin')
    );
    expect(hasSpinner).toBe(true);
  });

  it('displays error message on fetch failure', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to load events/i)
      ).toBeInTheDocument();
    });
  });

  it('filters events by search term', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockEvents),
      })
    );

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Search events by title or description/i
    );
    fireEvent.change(searchInput, { target: { value: 'React' } });

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
      expect(screen.queryByText('Coding Competition')).not.toBeInTheDocument();
    });
  });

  it('filters events by category', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockEvents),
      })
    );

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });

    const workshopButton = screen.getByRole('button', {
      name: /Workshops/i,
    });
    fireEvent.click(workshopButton);

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
      expect(
        screen.queryByText('Coding Competition')
      ).not.toBeInTheDocument();
    });
  });

  it('displays all events when "All" category is selected', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockEvents),
      })
    );

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });

    const allButton = screen.getByRole('button', { name: /All/i });
    fireEvent.click(allButton);

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
      expect(screen.getByText('AI Seminar')).toBeInTheDocument();
      expect(screen.getByText('Coding Competition')).toBeInTheDocument();
    });
  });

  it('combines search and category filters', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockEvents),
      })
    );

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });

    // Filter by category first
    const workshopButton = screen.getByRole('button', {
      name: /Workshops/i,
    });
    fireEvent.click(workshopButton);

    // Then search
    const searchInput = screen.getByPlaceholderText(
      /Search events by title or description/i
    );
    fireEvent.change(searchInput, { target: { value: 'React' } });

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });
  });

  it('shows "no events" message when filters return no results', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockEvents),
      })
    );

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      /Search events by title or description/i
    );
    fireEvent.change(searchInput, { target: { value: 'NonexistentEvent' } });

    await waitFor(() => {
      expect(
        screen.getByText(/No events found matching your search criteria/i)
      ).toBeInTheDocument();
    });
  });

  it('renders category filter buttons', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockEvents),
      })
    );

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Workshops/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Seminars/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Competitions/i })).toBeInTheDocument();
  });

  it('displays event details correctly', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockEvents),
      })
    );

    render(
      <BrowserRouter>
        <EventsArchive />
      </BrowserRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('React Workshop')).toBeInTheDocument();
        expect(screen.getByText('Learn React basics')).toBeInTheDocument();
        // Get all "Workshops" elements and check if at least one exists
        const workshops = screen.getAllByText('Workshops');
        expect(workshops.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });
});
