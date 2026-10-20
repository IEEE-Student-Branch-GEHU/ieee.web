import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EventsArchive from '../pages/EventsArchive';
import EventsArchivePage from '../app/events/page.next';

// Mock config
vi.mock('../config', () => ({
  default: 'http://localhost:5000/api',
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useInView: () => true,
}));

// Mock Reveal component
vi.mock('../components/animations/Reveal', () => ({
  Reveal: ({ children }) => <div>{children}</div>,
}));

// Mock ArchiveNavbar and Footer
vi.mock('../components/ArchiveNavbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

const mockEvents = [
  {
    _id: '1',
    title: 'React Workshop',
    description: 'Learn React basics',
    category: 'Workshop',
    date: '2024-04-15',
    image: 'https://via.placeholder.com/400x300',
  },
  {
    _id: '2',
    title: 'AI Seminar',
    description: 'Explore AI and Machine Learning',
    category: 'Technical',
    date: '2024-05-20',
    image: 'https://via.placeholder.com/400x300',
  }
];

describe('EventsArchive Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockSuccessResponse = (items) => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        events: items,
        totalPages: 1,
        totalEvents: items.length
      }),
    });

  const renderComponent = async () => {
    let result;
    await act(async () => {
      result = render(
        <BrowserRouter>
          <EventsArchive />
        </BrowserRouter>
      );
    });
    return result;
  };

  it('renders the page with header and layout', async () => {
    global.fetch = vi.fn(() => mockSuccessResponse(mockEvents));
    await renderComponent();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('fetches and displays events on mount', async () => {
    global.fetch = vi.fn(() => mockSuccessResponse(mockEvents));
    await renderComponent();

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/events?page=1&limit=6'),
      expect.any(Object)
    );
  });

  it('displays error message on fetch failure', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
    await renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/System connection failure/i)).toBeInTheDocument();
    });
  });

  it('filters events by search term (server-side)', async () => {
    global.fetch = vi.fn()
      .mockImplementationOnce(() => mockSuccessResponse(mockEvents))
      .mockImplementationOnce(() => mockSuccessResponse([mockEvents[0]]));

    await renderComponent();

    const searchInput = screen.getByPlaceholderText(/Search events by title\.\.\./i);
    
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'React' } });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=React'),
        expect.any(Object)
      );
    });
  });

  it('filters events by category (server-side)', async () => {
    global.fetch = vi.fn()
      .mockImplementationOnce(() => mockSuccessResponse(mockEvents))
      .mockImplementationOnce(() => mockSuccessResponse([mockEvents[0]]));

    await renderComponent();

    const workshopButton = screen.getByRole('button', { name: /^Workshop$/i });
    
    await act(async () => {
      fireEvent.click(workshopButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=Workshop'),
        expect.any(Object)
      );
    });
  });

  it('recovers after an API failure when the archive is requested again', async () => {
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockImplementationOnce(() => mockSuccessResponse([mockEvents[0]]));

    await renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/System connection failure/i)).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Workshop$/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
      expect(screen.queryByText(/System connection failure/i)).not.toBeInTheDocument();
    });
  });

  it('encodes search input before sending it to the backend', async () => {
    global.fetch = vi.fn()
      .mockImplementationOnce(() => mockSuccessResponse(mockEvents))
      .mockImplementationOnce(() => mockSuccessResponse([mockEvents[0]]));

    await renderComponent();

    const searchInput = screen.getByPlaceholderText(/Search events by title\.\.\./i);

    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'React & AI' } });
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=React+%26+AI'),
        expect.any(Object)
      );
    });
  });

  it('requests the selected pagination page from the backend', async () => {
    const paginatedResponse = (items, totalPages) => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        events: items,
        currentPage: 1,
        totalPages,
        totalEvents: items.length * totalPages,
      }),
    });

    global.fetch = vi.fn()
      .mockImplementationOnce(() => paginatedResponse(mockEvents, 2))
      .mockImplementationOnce(() => paginatedResponse([mockEvents[1]], 2));

    await renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '2' }));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2&limit=6'),
        expect.any(Object)
      );
    });
  });

  it('renders correctly even when data format is unexpected', async () => {
    // Backend might return raw array if not updated yet
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      })
    );

    await renderComponent();

    await waitFor(() => {
      expect(screen.getByText('React Workshop')).toBeInTheDocument();
    });
  });

  it('renders category filter buttons correctly', async () => {
    global.fetch = vi.fn(() => mockSuccessResponse(mockEvents));
    await renderComponent();

    expect(screen.getByRole('button', { name: /^All$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Workshop$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Technical$/i })).toBeInTheDocument();
  });

  it('displays button label correctly in overhauled UI', async () => {
    global.fetch = vi.fn(() => mockSuccessResponse(mockEvents));
    await renderComponent();
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /View Highlights/i })[0]).toBeInTheDocument();
    });
  });

  it('renders the Next route without a React Router provider', async () => {
    global.fetch = vi.fn(() => mockSuccessResponse(mockEvents));
    render(<EventsArchivePage />);
    expect(await screen.findByText('React Workshop')).toBeInTheDocument();
  });

  it('shows the existing empty state for an empty paginated response', async () => {
    global.fetch = vi.fn(() => mockSuccessResponse([]));
    await renderComponent();
    expect(screen.getByText('No Sessions Found')).toBeInTheDocument();
    expect(screen.getByAltText('No results')).toHaveAttribute('src');
    expect(screen.queryByRole('navigation', { name: 'Event pagination' })).not.toBeInTheDocument();
  });

  it('shows loading until the request finishes', async () => {
    let resolveRequest;
    global.fetch = vi.fn(() => new Promise(resolve => { resolveRequest = resolve; }));
    render(<EventsArchivePage />);
    expect(screen.getByRole('status')).toHaveTextContent('Curating sessions...');
    await act(async () => {
      resolveRequest(await mockSuccessResponse(mockEvents));
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('React Workshop')).toBeInTheDocument();
  });

  it('handles HTTP errors without treating them as empty results', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({ message: 'Service unavailable' }),
    });
    await renderComponent();
    expect(screen.getByRole('alert')).toHaveTextContent('System connection failure');
    expect(screen.queryByText('No Sessions Found')).not.toBeInTheDocument();
  });

  it('resets to page one when a category changes after pagination', async () => {
    global.fetch = vi.fn().mockImplementation(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ events: mockEvents, currentPage: 1, totalPages: 2, totalEvents: 8 }),
    }));
    await renderComponent();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('page=2&limit=6'), expect.any(Object)
      );
    });
    fireEvent.click(screen.getByRole('button', { name: 'Workshop' }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining('page=1&limit=6&search=&category=Workshop'), expect.any(Object)
      );
    });
    expect(screen.getByRole('button', { name: 'Workshop' })).toHaveAttribute('aria-pressed', 'true');
  });
});
