import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { googleState, identity, loadGoogleIdentityMock, loginMemberWithGoogleMock, adminFetchJsonMock } = vi.hoisted(() => {
  const identity = { initialize: vi.fn(), renderButton: vi.fn() };
  return {
    googleState: { clientId: 'test-client.apps.googleusercontent.com' },
    identity,
    loadGoogleIdentityMock: vi.fn(),
    loginMemberWithGoogleMock: vi.fn(),
    adminFetchJsonMock: vi.fn(),
  };
});

vi.mock('../lib/google-identity', () => ({
  get GOOGLE_CLIENT_ID() { return googleState.clientId; },
  loadGoogleIdentity: loadGoogleIdentityMock,
}));
vi.mock('../lib/member-api', () => ({ loginMemberWithGoogle: loginMemberWithGoogleMock }));
vi.mock('../lib/admin-api', () => ({ adminFetchJson: adminFetchJsonMock }));

import Footer from '../components/Footer';
import GoogleSignInButton from '../components/members/GoogleSignInButton';
import VolunteerGoogleAccess from '../components/admin/VolunteerGoogleAccess';

const TEAM_A = { _id: '507f1f77bcf86cd799439021', name: 'Asha Rawat', role: 'Volunteer' };
const TEAM_B = { _id: '507f1f77bcf86cd799439022', name: 'Dev Negi', role: 'Volunteer' };

const signInWith = async (credential) => {
  await waitFor(() => expect(identity.initialize).toHaveBeenCalled());
  const { callback } = identity.initialize.mock.calls[0][0];
  await callback({ credential });
};

describe('volunteer Google sign-in button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    googleState.clientId = 'test-client.apps.googleusercontent.com';
    loadGoogleIdentityMock.mockResolvedValue(identity);
  });

  it('renders Google\'s button for the configured OAuth client', async () => {
    render(<GoogleSignInButton />);

    await waitFor(() => expect(identity.renderButton).toHaveBeenCalled());
    expect(identity.initialize).toHaveBeenCalledWith(expect.objectContaining({
      client_id: 'test-client.apps.googleusercontent.com',
      ux_mode: 'popup',
    }));
    expect(identity.renderButton.mock.calls[0][0]).toBe(screen.getByTestId('google-sign-in'));
  });

  it('exchanges the Google credential for a member session', async () => {
    loginMemberWithGoogleMock.mockResolvedValue({ token: 'member-token' });
    render(<GoogleSignInButton />);

    await signInWith('google-id-token');

    expect(loginMemberWithGoogleMock).toHaveBeenCalledWith('google-id-token');
    expect(window.localStorage.getItem('memberToken')).toBe('member-token');
  });

  it('explains when a Google account is not authorized', async () => {
    loginMemberWithGoogleMock.mockRejectedValue(new Error('This Google account is not authorized for volunteer access'));
    render(<GoogleSignInButton />);

    await signInWith('google-id-token');

    expect(await screen.findByRole('alert')).toHaveTextContent('not authorized for volunteer access');
    expect(window.localStorage.getItem('memberToken')).toBeNull();
  });

  it('shows the volunteer login in the footer only when Google sign-in is configured', () => {
    const { unmount } = render(<Footer />);
    expect(screen.getByRole('heading', { name: 'Volunteer login' })).toBeInTheDocument();
    expect(screen.getByText('For volunteers authorized by the branch only.')).toBeInTheDocument();
    unmount();

    googleState.clientId = null;
    render(<Footer />);
    expect(screen.queryByRole('heading', { name: 'Volunteer login' })).not.toBeInTheDocument();
    expect(loadGoogleIdentityMock).toHaveBeenCalledTimes(1);
  });
});

describe('admin volunteer Google access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminFetchJsonMock.mockImplementation(async (path, options = {}) => {
      if (path === '/admin/members/google') return [{ teamId: TEAM_B._id, email: 'dev@gmail.com', status: 'active' }];
      if (options.method === 'PUT') return { teamId: TEAM_A._id, email: 'asha@gmail.com', status: 'active' };
      return { message: 'Volunteer Google access removed' };
    });
  });

  it('lists authorized emails and authorizes a new one for the selected profile', async () => {
    render(<VolunteerGoogleAccess members={[TEAM_A, TEAM_B]} />);

    const list = await screen.findByRole('list', { name: 'Authorized volunteer emails' });
    expect(within(list).getByText('dev@gmail.com')).toBeInTheDocument();
    expect(within(list).getByText('Dev Negi · Volunteer')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Google account email'), { target: { value: 'asha@gmail.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Authorize email' }));

    expect(await screen.findByRole('status')).toHaveTextContent('asha@gmail.com can now sign in with Google as Asha Rawat');
    expect(adminFetchJsonMock).toHaveBeenCalledWith(`/admin/members/${TEAM_A._id}/google`, {
      method: 'PUT',
      body: JSON.stringify({ email: 'asha@gmail.com' }),
    });
  });

  it('removes an authorized email after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<VolunteerGoogleAccess members={[TEAM_A, TEAM_B]} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Remove Google sign-in for dev@gmail.com' }));

    expect(await screen.findByRole('status')).toHaveTextContent('dev@gmail.com can no longer sign in with Google');
    expect(adminFetchJsonMock).toHaveBeenCalledWith(`/admin/members/${TEAM_B._id}/google`, { method: 'DELETE' });
  });
});
