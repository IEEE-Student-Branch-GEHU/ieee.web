import { afterEach, describe, expect, it, vi } from 'vitest';

const {
  connectDatabase,
  createMemberToken,
  enforceRateLimit,
  hashPassword,
  modelMocks,
  uploadFile,
  verifyMemberToken,
  verifyPassword,
} = vi.hoisted(() => ({
  connectDatabase: vi.fn().mockResolvedValue(undefined),
  createMemberToken: vi.fn().mockReturnValue('member-token'),
  enforceRateLimit: vi.fn().mockResolvedValue(undefined),
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  uploadFile: vi.fn(),
  verifyMemberToken: vi.fn(),
  verifyPassword: vi.fn(),
  modelMocks: {
    Team: { findById: vi.fn(), findOneAndUpdate: vi.fn() },
    Member: { findById: vi.fn(), findOne: vi.fn(), findOneAndUpdate: vi.fn(), findByIdAndUpdate: vi.fn() },
    RateLimit: {},
  },
}));

vi.mock('../server/db', () => ({ connectDatabase, isDatabaseReady: () => true }));
vi.mock('../server/models', () => modelMocks);
vi.mock('../server/storage', () => ({ certificateDownloadUrl: vi.fn(), destroyFile: vi.fn(), uploadFile }));
vi.mock('../server/security', async () => {
  class MockApiError extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  }

  return {
    ApiError: MockApiError,
    createActivationToken: vi.fn(),
    createAdminToken: vi.fn(),
    createMemberToken,
    enforceRateLimit,
    hashActivationToken: vi.fn(),
    hashPassword,
    verifyAdminRequest: vi.fn(),
    verifyMemberToken,
    verifyPassword,
  };
});

import { handleApiRequest } from '../server/api';

const memberId = '507f1f77bcf86cd799439011';
const teamId = '507f1f77bcf86cd799439021';

const request = (url, options = {}) => ({
  url: `http://localhost${url}`,
  method: options.method || 'GET',
  headers: new Headers(options.headers),
  json: vi.fn().mockResolvedValue(options.body || {}),
  formData: vi.fn().mockResolvedValue(options.formData || { get: vi.fn() }),
});

const memberQuery = (member) => ({ select: vi.fn().mockResolvedValue(member) });
const updatedTeamQuery = (team) => ({ lean: vi.fn().mockResolvedValue(team) });

afterEach(() => {
  vi.clearAllMocks();
});

describe('member self-service profile API', () => {
  it('rejects an unauthenticated profile update before database mutation', async () => {
    verifyMemberToken.mockReturnValue({ sub: memberId, teamId, ver: 0 });
    modelMocks.Member.findById.mockReturnValue(memberQuery(null));

    const response = await handleApiRequest(request('/api/member/profile', {
      method: 'PATCH',
      body: { bio: 'should not be saved' },
    }), ['member', 'profile']);

    expect(response.status).toBe(401);
    expect(modelMocks.Team.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('activates an administrator-provisioned account and only returns a confirmation', async () => {
    modelMocks.Member.findOneAndUpdate.mockResolvedValue({ _id: memberId, status: 'active' });

    const response = await handleApiRequest(request('/api/member/activate', {
      method: 'POST',
      body: { token: 'one-time-secret', password: 'a-member-password' },
    }), ['member', 'activate']);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: 'Member account activated' });
    expect(modelMocks.Member.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'pending', activationExpiresAt: { $gt: expect.any(Date) } }),
      expect.objectContaining({ $set: expect.objectContaining({ status: 'active', passwordHash: 'hashed-password' }) }),
      { new: true, runValidators: true },
    );
  });

  it('logs in an active member without returning confidential account fields', async () => {
    const member = { _id: memberId, teamId, status: 'active', tokenVersion: 0, passwordHash: 'hashed-password' };
    modelMocks.Member.findOne.mockReturnValue(memberQuery(member));
    verifyPassword.mockResolvedValue(true);

    const response = await handleApiRequest(request('/api/member/login', {
      method: 'POST',
      body: { username: 'Ada.Member', password: 'a-member-password' },
    }), ['member', 'login']);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ token: 'member-token' });
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(createMemberToken).toHaveBeenCalledWith({ memberId, teamId, tokenVersion: 0 });
  });

  it('invalidates a member token on logout', async () => {
    verifyMemberToken.mockReturnValue({ sub: memberId, teamId, ver: 0 });
    modelMocks.Member.findById.mockReturnValue(memberQuery({ _id: memberId, teamId, status: 'active', tokenVersion: 0 }));
    modelMocks.Team.findById.mockResolvedValue({ _id: teamId, name: 'Ada', role: 'Chair', category: 'executive' });
    modelMocks.Member.findByIdAndUpdate.mockResolvedValue({});

    const response = await handleApiRequest(request('/api/member/logout', {
      method: 'POST',
      headers: { Authorization: 'Bearer member-token' },
    }), ['member', 'logout']);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: 'Member signed out' });
    expect(modelMocks.Member.findByIdAndUpdate).toHaveBeenCalledWith(memberId, { $inc: { tokenVersion: 1 } });
  });

  it('persists valid profile fields using the authenticated team link', async () => {
    verifyMemberToken.mockReturnValue({ sub: memberId, teamId, ver: 0 });
    modelMocks.Member.findById.mockReturnValue(memberQuery({ _id: memberId, teamId, status: 'active', tokenVersion: 0 }));
    modelMocks.Team.findById.mockResolvedValue({ _id: teamId, name: 'Ada', role: 'Chair', category: 'executive' });
    modelMocks.Team.findOneAndUpdate.mockReturnValue(updatedTeamQuery({
      _id: teamId,
      name: 'Ada',
      role: 'Chair',
      category: 'executive',
      bio: 'Updated public bio',
      skills: ['Robotics'],
    }));

    const response = await handleApiRequest(request('/api/member/profile', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer member-token' },
      body: { bio: 'Updated public bio', skills: ['Robotics'] },
    }), ['member', 'profile']);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ profile: expect.objectContaining({ bio: 'Updated public bio', skills: ['Robotics'] }) });
    expect(modelMocks.Team.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: teamId },
      { bio: 'Updated public bio', skills: ['Robotics'] },
      { new: true, runValidators: true },
    );
  });

  it('rejects an unauthenticated profile image upload before reading the file', async () => {
    verifyMemberToken.mockReturnValue({ sub: memberId, teamId, ver: 0 });
    modelMocks.Member.findById.mockReturnValue(memberQuery(null));
    const formData = { get: vi.fn() };

    const response = await handleApiRequest(request('/api/member/profile/image', {
      method: 'POST',
      formData,
    }), ['member', 'profile', 'image']);

    expect(response.status).toBe(401);
    expect(formData.get).not.toHaveBeenCalled();
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('stores an uploaded profile image on the authenticated member team only', async () => {
    verifyMemberToken.mockReturnValue({ sub: memberId, teamId, ver: 0 });
    modelMocks.Member.findById.mockReturnValue(memberQuery({ _id: memberId, teamId, status: 'active', tokenVersion: 0 }));
    modelMocks.Team.findById.mockResolvedValue({ _id: teamId, name: 'Ada', role: 'Chair', category: 'executive' });
    const file = { name: 'avatar.png', type: 'image/png', size: 12 };
    const formData = { get: vi.fn().mockReturnValue(file) };
    uploadFile.mockResolvedValue({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/avatar.png',
      public_id: 'ieee-website/avatar',
      resource_type: 'image',
    });
    modelMocks.Team.findOneAndUpdate.mockReturnValue(updatedTeamQuery({
      _id: teamId,
      name: 'Ada',
      role: 'Chair',
      category: 'executive',
      image: 'https://res.cloudinary.com/demo/image/upload/avatar.png',
    }));

    const response = await handleApiRequest(request('/api/member/profile/image', {
      method: 'POST',
      formData,
      headers: { Authorization: 'Bearer member-token' },
    }), ['member', 'profile', 'image']);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      profile: expect.objectContaining({
        _id: teamId,
        image: 'https://res.cloudinary.com/demo/image/upload/avatar.png',
      }),
    });
    expect(uploadFile).toHaveBeenCalledWith(file);
    expect(modelMocks.Team.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: teamId },
      { $set: { image: 'https://res.cloudinary.com/demo/image/upload/avatar.png' } },
      { new: true, runValidators: true },
    );
  });

  it('rejects member profile payloads that try to override ownership or privileged fields', async () => {
    verifyMemberToken.mockReturnValue({ sub: memberId, teamId, ver: 0 });
    modelMocks.Member.findById.mockReturnValue(memberQuery({ _id: memberId, teamId, status: 'active', tokenVersion: 0 }));
    modelMocks.Team.findById.mockResolvedValue({ _id: teamId, name: 'Ada', role: 'Chair', category: 'executive' });

    const response = await handleApiRequest(request('/api/member/profile', {
      method: 'PATCH',
      headers: { Authorization: 'Bearer member-token' },
      body: { bio: 'safe', teamId, role: 'Admin', '$where': 'true' },
    }), ['member', 'profile']);

    expect(response.status).toBe(400);
    expect(modelMocks.Team.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('keeps private fields out of the anonymous public profile response', async () => {
    modelMocks.Team.findById.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: teamId,
        name: 'Ada',
        role: 'Chair',
        category: 'executive',
        image: 'https://res.cloudinary.com/demo/image/upload/avatar.png',
        email: 'private@example.test',
        phone: '+1 555 0100',
        passwordHash: 'must-not-leak',
      }),
    });

    const response = await handleApiRequest(request(`/api/team/${teamId}`), ['team', teamId]);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(expect.objectContaining({ _id: teamId, name: 'Ada', image: expect.any(String) }));
    expect(body.email).toBeUndefined();
    expect(body.phone).toBeUndefined();
    expect(body.passwordHash).toBeUndefined();
  });
});
