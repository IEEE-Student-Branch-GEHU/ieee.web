import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminAuthGuard from '../components/admin-next/AdminAuthGuard';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ replace }),
}));

describe('Next admin authentication guard', () => {
  beforeEach(() => {
    replace.mockReset();
    localStorage.clear();
  });

  it('does not expose protected children before client authentication resolves', async () => {
    render(<AdminAuthGuard><p>Protected dashboard</p></AdminAuthGuard>);
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Checking administrator access...')).toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/admin/login'));
    expect(screen.queryByText('Protected dashboard')).not.toBeInTheDocument();
  });

  it('renders protected children after a token is found', async () => {
    localStorage.setItem('adminToken', 'valid-token');
    render(<AdminAuthGuard><p>Protected dashboard</p></AdminAuthGuard>);
    await waitFor(() => expect(screen.getByText('Protected dashboard')).toBeInTheDocument());
    expect(replace).not.toHaveBeenCalled();
  });
});
