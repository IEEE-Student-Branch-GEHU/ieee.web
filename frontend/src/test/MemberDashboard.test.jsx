import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { clearMemberToken, logoutMember, memberFetchJson } = vi.hoisted(() => ({
  clearMemberToken: vi.fn(),
  logoutMember: vi.fn(),
  memberFetchJson: vi.fn(),
}));

vi.mock('../lib/member-api', () => ({ clearMemberToken, logoutMember, memberFetchJson }));
vi.mock('../lib/public-site', () => ({ getStableMemberId: member => member?._id || null }));
vi.mock('../components/Navbar', () => ({ default: () => <nav aria-label="Primary navigation" /> }));
vi.mock('../components/Footer', () => ({ default: () => <footer /> }));

import MemberDashboard from '../components/members/MemberDashboard';

const account = {
  id: '507f1f77bcf86cd799439011',
  username: 'ada.member',
  status: 'active',
  profile: {
    _id: '507f1f77bcf86cd799439021',
    name: 'Ada Lovelace',
    role: 'Chair',
    category: 'executive',
    bio: 'Public bio',
  },
};

describe('member dashboard self-service upload', () => {
  beforeEach(() => {
    memberFetchJson.mockReset();
    memberFetchJson.mockImplementation(path => {
      if (path === '/member/me') return Promise.resolve(account);
      if (path === '/member/certificates') return Promise.resolve([]);
      if (path === '/member/profile/image') return Promise.resolve({
        profile: { ...account.profile, image: 'https://res.cloudinary.com/test/image/upload/avatar.png' },
      });
      return Promise.resolve({ profile: account.profile });
    });
  });

  it('uploads the selected image through the authenticated member endpoint and shows the saved result', async () => {
    render(<MemberDashboard />);

    await screen.findByRole('heading', { name: 'Your community profile' });
    const selectedFile = new File(['image bytes'], 'avatar.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Choose new photo'), { target: { files: [selectedFile] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload photo' }));

    await waitFor(() => expect(memberFetchJson).toHaveBeenCalledWith(
      '/member/profile/image',
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) }),
    ));
    const [, options] = memberFetchJson.mock.calls.find(([path]) => path === '/member/profile/image');
    expect(options.body.get('image')).toBe(selectedFile);
    expect(await screen.findByRole('status')).toHaveTextContent('Profile image updated.');
    expect(screen.getByAltText('Ada Lovelace profile')).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/test/image/upload/avatar.png',
    );
  });
});
