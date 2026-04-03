import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Contact from './Contact';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }) => <div className={className}>{children}</div>,
    button: ({ children, onClick, className, type, disabled, ...props }) => (
      <button onClick={onClick} className={className} type={type} disabled={disabled}>{children}</button>
    ),
  },
}));

// Mock Reveal animation wrapper — pass-through
vi.mock('./animations/Reveal', () => ({
  Reveal: ({ children }) => <div>{children}</div>,
}));

// Mock config for API_BASE_URL
vi.mock('../config', () => ({
  default: 'http://localhost:5000/api',
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Send: (props) => <span data-testid="icon-send">Send</span>,
  Phone: (props) => <span data-testid="icon-phone">Phone</span>,
  MapPin: (props) => <span data-testid="icon-mappin">MapPin</span>,
  Mail: (props) => <span data-testid="icon-mail">Mail</span>,
  Loader2: (props) => <span data-testid="icon-loader">Loading</span>,
  CheckCircle: (props) => <span data-testid="icon-check">Check</span>,
}));

describe('Contact Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all form fields with correct labels', () => {
    render(<Contact />);

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Inquiry Details')).toBeInTheDocument();
  });

  it('renders all form input elements', () => {
    render(<Contact />);

    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john@ieee.org')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('How can we help your innovation journey?')).toBeInTheDocument();
  });

  it('renders the submit button with default text', () => {
    render(<Contact />);

    expect(screen.getByText('Launch Message')).toBeInTheDocument();
  });

  it('renders the contact information section', () => {
    render(<Contact />);

    expect(screen.getByText('IEEE Headquarters')).toBeInTheDocument();
    expect(screen.getByText('ieee@gehu.ac.in')).toBeInTheDocument();
    expect(screen.getByText('Mon - Sat: 9AM - 5PM')).toBeInTheDocument();
  });

  it('renders the section heading', () => {
    render(<Contact />);

    expect(screen.getByText('Connect with Us')).toBeInTheDocument();
    expect(screen.getByText('Get In Touch')).toBeInTheDocument();
  });

  it('updates form fields on user input', () => {
    render(<Contact />);

    const firstNameInput = screen.getByPlaceholderText('John');
    const emailInput = screen.getByPlaceholderText('john@ieee.org');
    const messageInput = screen.getByPlaceholderText('How can we help your innovation journey?');

    fireEvent.change(firstNameInput, { target: { value: 'Archit', name: 'firstName' } });
    fireEvent.change(emailInput, { target: { value: 'archit@ieee.org', name: 'email' } });
    fireEvent.change(messageInput, { target: { value: 'Hello IEEE!', name: 'message' } });

    expect(firstNameInput.value).toBe('Archit');
    expect(emailInput.value).toBe('archit@ieee.org');
    expect(messageInput.value).toBe('Hello IEEE!');
  });

  it('shows loading state during form submission', async () => {
    // Mock a slow fetch that never resolves during this test
    global.fetch = vi.fn(() => new Promise(() => {}));

    render(<Contact />);

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Test', name: 'firstName' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'User', name: 'lastName' } });
    fireEvent.change(screen.getByPlaceholderText('john@ieee.org'), { target: { value: 'test@test.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('How can we help your innovation journey?'), { target: { value: 'Hello', name: 'message' } });

    // Submit the form
    const submitButton = screen.getByText('Launch Message').closest('button');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Should show loading state
    expect(screen.getByText('Transmitting')).toBeInTheDocument();
  });

  it('shows success message on successful submission', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(<Contact />);

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Test', name: 'firstName' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'User', name: 'lastName' } });
    fireEvent.change(screen.getByPlaceholderText('john@ieee.org'), { target: { value: 'test@test.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('How can we help your innovation journey?'), { target: { value: 'Hello', name: 'message' } });

    // Submit
    const submitButton = screen.getByText('Launch Message').closest('button');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Message Received.')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully (network failure)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(<Contact />);

    // Fill and submit
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Test', name: 'firstName' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'User', name: 'lastName' } });
    fireEvent.change(screen.getByPlaceholderText('john@ieee.org'), { target: { value: 'test@test.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('How can we help your innovation journey?'), { target: { value: 'Hello', name: 'message' } });

    const submitButton = screen.getByText('Launch Message').closest('button');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      // After error, button should return to idle state (Launch Message)
      expect(screen.getByText('Launch Message')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('handles non-success API response', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: false }),
      })
    );

    render(<Contact />);

    // Fill and submit
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Test', name: 'firstName' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'User', name: 'lastName' } });
    fireEvent.change(screen.getByPlaceholderText('john@ieee.org'), { target: { value: 'test@test.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('How can we help your innovation journey?'), { target: { value: 'Hello', name: 'message' } });

    const submitButton = screen.getByText('Launch Message').closest('button');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      // Should NOT show success message
      expect(screen.queryByText('Message Received.')).not.toBeInTheDocument();
      // Button returns to idle
      expect(screen.getByText('Launch Message')).toBeInTheDocument();
    });
  });

  it('calls fetch with correct URL and payload', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(<Contact />);

    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Archit', name: 'firstName' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Mittal', name: 'lastName' } });
    fireEvent.change(screen.getByPlaceholderText('john@ieee.org'), { target: { value: 'archit@ieee.org', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('How can we help your innovation journey?'), { target: { value: 'Great work!', name: 'message' } });

    const submitButton = screen.getByText('Launch Message').closest('button');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/contact',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: 'Archit',
            lastName: 'Mittal',
            email: 'archit@ieee.org',
            message: 'Great work!',
          }),
        })
      );
    });
  });

  it('disables submit button while submitting', async () => {
    global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves

    render(<Contact />);

    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Test', name: 'firstName' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'User', name: 'lastName' } });
    fireEvent.change(screen.getByPlaceholderText('john@ieee.org'), { target: { value: 'test@test.com', name: 'email' } });
    fireEvent.change(screen.getByPlaceholderText('How can we help your innovation journey?'), { target: { value: 'Hello', name: 'message' } });

    const submitButton = screen.getByText('Launch Message').closest('button');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Button should be disabled during submission
    const transmittingButton = screen.getByText('Transmitting').closest('button');
    expect(transmittingButton).toBeDisabled();
  });
});
