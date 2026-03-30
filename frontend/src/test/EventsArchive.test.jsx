import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EventsArchive from '../pages/EventsArchive';

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
      expect.stringContaining('/api/events?page=1&limit=6')
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
        expect.stringContaining('search=React')
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
        expect.stringContaining('category=Workshop')
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
});
