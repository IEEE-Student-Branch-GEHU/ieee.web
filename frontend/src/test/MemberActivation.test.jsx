import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { activateMemberMock } = vi.hoisted(() => ({ activateMemberMock: vi.fn() }));

vi.mock('../lib/member-api', () => ({ activateMember: activateMemberMock }));
vi.mock('../components/theme/ThemeToggle', () => ({ ThemeToggle: () => <button type="button">Theme</button> }));

import MemberActivation from '../components/members/MemberActivation';

describe('member activation security flow', () => {
  beforeEach(() => {
    activateMemberMock.mockReset();
    activateMemberMock.mockResolvedValue({ message: 'Member account activated' });
    window.history.replaceState({}, '', '/member/activate');
  });

  it('reads a fragment token once and immediately removes it from the URL', async () => {
    window.history.replaceState({}, '', '/member/activate#token=fragment-secret');
    render(<MemberActivation />);

    await waitFor(() => expect(screen.getByLabelText('Activation secret')).toHaveValue('fragment-secret'));
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('');
  });

  it('does not accept activation secrets from query strings', async () => {
    window.history.replaceState({}, '', '/member/activate?token=query-secret');
    render(<MemberActivation />);

    await waitFor(() => expect(screen.getByLabelText('Activation secret')).toHaveValue(''));
    expect(window.location.search).toBe('');
  });

  it('requires matching passwords before sending the activation secret', async () => {
    render(<MemberActivation />);
    fireEvent.change(screen.getByLabelText('Activation secret'), { target: { value: 'activation-secret' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'long-password-one' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'long-password-two' } });
    fireEvent.click(screen.getByRole('button', { name: 'Activate account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Passwords do not match');
    expect(activateMemberMock).not.toHaveBeenCalled();
  });
});
