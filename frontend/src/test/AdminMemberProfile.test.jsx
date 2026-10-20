import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import './dialog-support';
import {
  buildMemberPayload,
  createMemberForm,
} from '../components/admin/memberProfile';
import MemberProfileActions from '../components/admin/MemberProfileActions';

const { fetchJson, adminFetchJson } = vi.hoisted(() => ({
  fetchJson: vi.fn(),
  adminFetchJson: vi.fn(),
}));

vi.mock('../lib/http', () => ({ fetchJson }));
vi.mock('../lib/admin-api', () => ({ adminFetchJson }));
vi.mock('../components/members/MemberQr', () => ({
  default: ({ member }) => <div data-testid="member-qr">QR for {member.name}</div>,
}), { virtual: true });

import TeamManage from '../pages/admin/TeamManage';
import AdminTeamNext from '../components/admin-next/AdminTeamNext';

const member = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Ada Lovelace',
  role: 'Chairperson',
  category: 'executive',
  image: 'https://images.example/ada.jpg',
  bio: 'Approved public biography',
  committee: 'Executive Committee',
  academicYear: '2025-2026',
  branch: 'Dehradun',
  year: '2025-2026',
  skills: ['Robotics'],
  interests: ['Education'],
  achievements: ['Branch award'],
  isLead: true,
  rank: 1,
  order: 4,
  socials: {
    linkedin: 'https://linkedin.example/ada',
    instagram: 'https://instagram.example/ada',
    twitter: 'https://x.example/ada',
  },
  email: 'private@example.com',
  phone: '+1 555 0100',
};

describe('member profile payloads', () => {
  it('maps approved profile fields and preserves supported existing socials without private data', () => {
    const form = createMemberForm(member, 'executive');
    form.github = 'https://github.example/ada';
    form.skills = ['Robotics', 'Python'];
    form.achievements = ['Branch award', 'Published paper'];

    expect(buildMemberPayload(form)).toEqual({
      name: 'Ada Lovelace',
      role: 'Chairperson',
      category: 'executive',
      image: 'https://images.example/ada.jpg',
      bio: 'Approved public biography',
      committee: 'Executive Committee',
      academicYear: '2025-2026',
      branch: 'Dehradun',
      year: '2025-2026',
      skills: ['Robotics', 'Python'],
      interests: ['Education'],
      achievements: ['Branch award', 'Published paper'],
      isLead: true,
      rank: 1,
      order: 4,
      socials: {
        linkedin: 'https://linkedin.example/ada',
        instagram: 'https://instagram.example/ada',
        twitter: 'https://x.example/ada',
        github: 'https://github.example/ada',
      },
    });
  });

  it('does not copy DTO identifiers or private contact fields into the payload', () => {
    const payload = buildMemberPayload(createMemberForm(member, 'executive'));

    expect(payload).not.toHaveProperty('_id');
    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('email');
    expect(payload).not.toHaveProperty('phone');
  });
});

describe('member profile actions', () => {
  it('links to the public profile and opens the QR modal for a stable Mongo ID', async () => {
    render(<MemberProfileActions member={{ ...member, _id: '507f1f77bcf86cd799439012' }} />);

    expect(screen.getByRole('link', { name: 'Open profile' })).toHaveAttribute('href', '/members/507f1f77bcf86cd799439012');
    fireEvent.click(screen.getByRole('button', { name: 'View QR code for Ada Lovelace' }));

    expect(await screen.findByTestId('member-qr')).toHaveTextContent('QR for Ada Lovelace');
  });
});

describe('Vite admin member management', () => {
  beforeEach(() => {
    fetchJson.mockReset();
    fetchJson.mockResolvedValue([member]);
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('submits profile fields through the existing Vite edit form and resets create state', async () => {
    render(<TeamManage />);
    await screen.findByText('Ada Lovelace');

    fireEvent.click(screen.getByRole('button', { name: 'Edit Ada Lovelace' }));
    fireEvent.change(screen.getByLabelText('GitHub URL'), { target: { value: 'https://github.example/ada' } });
    fireEvent.change(screen.getByLabelText('Committee'), { target: { value: 'Publications Committee' } });
    fireEvent.change(screen.getByLabelText('Skills (one per line)'), { target: { value: 'Robotics\nPython' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Save Member' }).closest('form'));

    await waitFor(() => expect(fetchJson).toHaveBeenCalledWith(
      expect.stringContaining('/admin/team/507f1f77bcf86cd799439011'),
      expect.objectContaining({ method: 'PUT' }),
    ));
    const [, options] = fetchJson.mock.calls.find(([, request]) => request?.method === 'PUT');
    expect(JSON.parse(options.body)).toMatchObject({
      committee: 'Publications Committee',
      skills: ['Robotics', 'Python'],
      socials: expect.objectContaining({
        linkedin: 'https://linkedin.example/ada',
        instagram: 'https://instagram.example/ada',
        github: 'https://github.example/ada',
        twitter: 'https://x.example/ada',
      }),
    });
    expect(JSON.parse(options.body)).not.toHaveProperty('email');

    fireEvent.click(screen.getByRole('button', { name: 'Add Member' }));
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('deletes a member using its stable Mongo ID', async () => {
    render(<TeamManage />);
    await screen.findByText('Ada Lovelace');
    fireEvent.click(screen.getByRole('button', { name: 'Delete Ada Lovelace' }));

    await waitFor(() => expect(fetchJson).toHaveBeenCalledWith(
      expect.stringContaining('/admin/team/507f1f77bcf86cd799439011'),
      expect.objectContaining({ method: 'DELETE' }),
    ));
  });
});

describe('Next admin member management', () => {
  beforeEach(() => {
    adminFetchJson.mockReset();
    adminFetchJson.mockResolvedValue([member]);
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('submits the same public profile contract through the Next admin form', async () => {
    render(<AdminTeamNext />);
    await screen.findByText('Ada Lovelace');

    fireEvent.click(screen.getByRole('button', { name: 'Edit Ada Lovelace' }));
    fireEvent.change(screen.getByLabelText('Academic year'), { target: { value: '2026-2027' } });
    fireEvent.change(screen.getByLabelText('GitHub URL'), { target: { value: 'https://github.example/ada' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Save Member' }).closest('form'));

    await waitFor(() => expect(adminFetchJson).toHaveBeenCalledWith(
      '/admin/team/507f1f77bcf86cd799439011',
      expect.objectContaining({ method: 'PUT' }),
    ));
    const [, options] = adminFetchJson.mock.calls.find(([path, request]) => path === '/admin/team/507f1f77bcf86cd799439011' && request?.method === 'PUT');
    expect(JSON.parse(options.body)).toMatchObject({
      academicYear: '2026-2027',
      socials: expect.objectContaining({
        linkedin: 'https://linkedin.example/ada',
        instagram: 'https://instagram.example/ada',
        github: 'https://github.example/ada',
      }),
    });
  });

  it('uses the stable Mongo ID for Next delete actions too', async () => {
    render(<AdminTeamNext />);
    await screen.findByText('Ada Lovelace');
    fireEvent.click(screen.getByRole('button', { name: 'Delete Ada Lovelace' }));

    await waitFor(() => expect(adminFetchJson).toHaveBeenCalledWith(
      '/admin/team/507f1f77bcf86cd799439011',
      expect.objectContaining({ method: 'DELETE' }),
    ));
  });
});
