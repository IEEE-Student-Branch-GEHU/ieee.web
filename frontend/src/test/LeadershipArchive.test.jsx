import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LeadershipArchive from '../pages/archive/LeadershipArchive';

// Mock config
vi.mock('../config', () => ({
  default: 'http://localhost:5000/api',
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock YearSelector so we can control year selection independently
vi.mock('../components/archive/YearSelector', () => ({
  default: ({ onYearChange }) => (
    <div data-testid="year-selector">
      <button onClick={() => onYearChange('2023-2024')}>2023-2024</button>
      <button onClick={() => onYearChange('2022-2023')}>2022-2023</button>
    </div>
  ),
}));

// Mock MemberCard to keep tests simple
vi.mock('../components/archive/MemberCard', () => ({
  default: ({ member }) => (
    <div data-testid="member-card" data-member-name={member.name}>
      {member.name} - {member.role}
    </div>
  ),
}));

// Mock assets
vi.mock('../assets/logo.png', () => ({ default: 'logo.png' }));

const mockLeads = [
  { _id: '1', name: 'Alice Johnson', role: 'Chairperson', category: 'executive', isLead: true },
];
const mockCoreMembers = [
  { _id: '2', name: 'Bob Smith', role: 'Technical Lead', category: 'technical', isLead: false },
];
const mockGeneralMembers = [
  { _id: '3', name: 'Carol White', role: 'Volunteer', category: 'member', isLead: false },
];
const mockAllMembers = [...mockLeads, ...mockCoreMembers, ...mockGeneralMembers];

describe('LeadershipArchive Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockMembersResponse = (members) =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(members),
    });

  const renderComponent = async () => {
    let result;
    await act(async () => {
      result = render(
        <BrowserRouter>
          <LeadershipArchive />
        </BrowserRouter>
      );
    });
    return result;
  };

  it('renders the page with header and year selector', async () => {
    global.fetch = vi.fn(() => mockMembersResponse(mockAllMembers));
    await renderComponent();
    expect(screen.getByTestId('year-selector')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('fetches members when a year is selected', async () => {
    global.fetch = vi.fn(() => mockMembersResponse(mockAllMembers));
    await renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByText('2023-2024'));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/team?year=2023-2024')
      );
    });
  });

  it('groups members into leads, core, and general sections', async () => {
    global.fetch = vi.fn(() => mockMembersResponse(mockAllMembers));
    await renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByText('2023-2024'));
    });

    await waitFor(() => {
      expect(screen.getByText('Executive Leads')).toBeInTheDocument();
      expect(screen.getByText('Core Committee')).toBeInTheDocument();
      expect(screen.getByText('Student Volunteers')).toBeInTheDocument();
    });
  });

  it('displays all member cards after fetch', async () => {
    global.fetch = vi.fn(() => mockMembersResponse(mockAllMembers));
    await renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByText('2023-2024'));
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('member-card')).toHaveLength(3);
    });
  });

  it('shows empty state when no members found for selected year', async () => {
    global.fetch = vi.fn(() => mockMembersResponse([]));
    await renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByText('2023-2024'));
    });

    await waitFor(() => {
      expect(screen.getByText(/No records found for session/i)).toBeInTheDocument();
    });
  });

  it('shows error state when fetch fails', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
    );
    await renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByText('2023-2024'));
    });

    await waitFor(() => {
      expect(screen.getByText(/Could not load members/i)).toBeInTheDocument();
    });
  });

  it('renders category filter buttons when a year is selected', async () => {
    global.fetch = vi.fn(() => mockMembersResponse(mockAllMembers));
    await renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByText('2023-2024'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /All Roles/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Executive/i })).toBeInTheDocument();
    });
  });

  it('applies category filter to fetch request', async () => {
    global.fetch = vi.fn(() => mockMembersResponse(mockAllMembers));
    await renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByText('2023-2024'));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Technical/i })).toBeInTheDocument();
    });

    global.fetch = vi.fn(() => mockMembersResponse([mockCoreMembers[0]]));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Technical/i }));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('category=technical')
      );
    });
  });

  it('shows member count in results footer', async () => {
    global.fetch = vi.fn(() => mockMembersResponse(mockAllMembers));
    await renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByText('2023-2024'));
    });

    await waitFor(() => {
      expect(screen.getByText(/Records Found/i)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});
