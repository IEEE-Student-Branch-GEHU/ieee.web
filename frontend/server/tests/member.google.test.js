const express = require('express');
const request = require('supertest');

const TEAM_A_ID = '507f1f77bcf86cd799439021';
const TEAM_B_ID = '507f1f77bcf86cd799439022';
const MOCK_MEMBER_A_ID = '507f1f77bcf86cd799439011';

const mockMembers = new Map();
const mockVerifyGoogleCredential = jest.fn();
const mockTeamFindById = jest.fn();

const mockMatches = (member, filter) => Object.entries(filter).every(([key, condition]) => {
  if (key === '$or') return condition.some(option => mockMatches(member, option));
  const value = member[key];
  if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
    if ('$exists' in condition) return (value !== undefined) === condition.$exists;
    if ('$ne' in condition) return value !== condition.$ne;
  }
  return String(value) === String(condition);
});
const mockFindMember = filter => [...mockMembers.values()].find(member => mockMatches(member, filter)) || null;
const mockApplyUpdate = (member, update) => {
  Object.assign(member, update.$set || {});
  for (const field of Object.keys(update.$unset || {})) delete member[field];
  for (const [field, amount] of Object.entries(update.$inc || {})) member[field] = (member[field] || 0) + amount;
  return member;
};

jest.mock('../models/Admin', () => ({}));
jest.mock('../models/Event', () => ({}));
jest.mock('../models/Certificate', () => ({}));
jest.mock('../models/Team', () => ({ findById: (...args) => mockTeamFindById(...args) }));
jest.mock('../models/Member', () => ({
  find: async filter => [...mockMembers.values()].filter(member => mockMatches(member, filter)),
  findOne: async filter => mockFindMember(filter),
  findById: async id => mockMembers.get(String(id)) || null,
  findOneAndUpdate: async (filter, update) => {
    const member = mockFindMember(filter);
    return member ? mockApplyUpdate(member, update) : null;
  },
  create: async (record) => {
    const member = { _id: MOCK_MEMBER_A_ID, ...record };
    mockMembers.set(member._id, member);
    return member;
  },
}));
jest.mock('../services/google-auth', () => ({
  verifyGoogleCredential: (...args) => mockVerifyGoogleCredential(...args),
}));
jest.mock('../config/cloudinary', () => ({ storage: {}, certificateStorage: {}, cloudinary: {} }));
jest.mock('express-rate-limit', () => () => (req, res, next) => next());

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'member-google-test-signing-secret-with-enough-length';
process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';

const adminRoutes = require('../routes/admin');
const memberRoutes = require('../routes/member');
const { createAdminToken } = require('../services/admin-auth');
const { verifyMemberToken } = require('../services/member-auth');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  app.use('/api/member', memberRoutes);
  return app;
};

const adminToken = createAdminToken({ username: 'administrator' }, process.env.JWT_SECRET);
const signInWithGoogle = () => request(createApp()).post('/api/member/google').send({ credential: 'google-id-token' });

beforeEach(() => {
  mockMembers.clear();
  jest.clearAllMocks();
  process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
  mockTeamFindById.mockImplementation(async id => ([TEAM_A_ID, TEAM_B_ID].includes(String(id)) ? { _id: id } : null));
  mockVerifyGoogleCredential.mockResolvedValue({ subject: 'google-sub-a', email: 'volunteer@gmail.com' });
});

describe('volunteer Google sign-in', () => {
  it('signs in an authorized email, binds the Google account and returns a member token', async () => {
    mockMembers.set(MOCK_MEMBER_A_ID, { _id: MOCK_MEMBER_A_ID, teamId: TEAM_A_ID, username: 'member.a', email: 'volunteer@gmail.com', status: 'active', tokenVersion: 0 });

    const response = await signInWithGoogle();

    expect(response.status).toBe(200);
    expect(mockVerifyGoogleCredential).toHaveBeenCalledWith('google-id-token', 'test-client.apps.googleusercontent.com');
    const decoded = verifyMemberToken(response.body.token, process.env.JWT_SECRET);
    expect(decoded.sub).toBe(MOCK_MEMBER_A_ID);
    expect(decoded.teamId).toBe(TEAM_A_ID);
    expect(mockMembers.get(MOCK_MEMBER_A_ID).googleSubject).toBe('google-sub-a');
  });

  it('activates a pending account whose email an administrator authorized', async () => {
    mockMembers.set(MOCK_MEMBER_A_ID, {
      _id: MOCK_MEMBER_A_ID, teamId: TEAM_A_ID, username: 'member.a', email: 'volunteer@gmail.com',
      status: 'pending', activationTokenHash: 'hash', tokenVersion: 0,
    });

    const response = await signInWithGoogle();

    expect(response.status).toBe(200);
    expect(mockMembers.get(MOCK_MEMBER_A_ID)).toMatchObject({ status: 'active', googleSubject: 'google-sub-a' });
    expect(mockMembers.get(MOCK_MEMBER_A_ID).activationTokenHash).toBeUndefined();
  });

  it('rejects Google accounts whose email is not authorized', async () => {
    const response = await signInWithGoogle();

    expect(response.status).toBe(403);
    expect(response.body.token).toBeUndefined();
  });

  it('rejects a different Google account using a re-assigned email address', async () => {
    mockMembers.set(MOCK_MEMBER_A_ID, { _id: MOCK_MEMBER_A_ID, teamId: TEAM_A_ID, username: 'member.a', email: 'volunteer@gmail.com', googleSubject: 'original-sub', status: 'active', tokenVersion: 0 });

    const response = await signInWithGoogle();

    expect(response.status).toBe(403);
  });

  it('rejects disabled accounts', async () => {
    mockMembers.set(MOCK_MEMBER_A_ID, { _id: MOCK_MEMBER_A_ID, teamId: TEAM_A_ID, username: 'member.a', email: 'volunteer@gmail.com', status: 'disabled', tokenVersion: 0 });

    const response = await signInWithGoogle();

    expect(response.status).toBe(403);
  });

  it('rejects credentials Google cannot verify', async () => {
    mockVerifyGoogleCredential.mockRejectedValue(new Error('bad token'));

    const response = await signInWithGoogle();

    expect(response.status).toBe(401);
  });

  it('reports Google sign-in as unavailable when no OAuth client is configured', async () => {
    delete process.env.GOOGLE_CLIENT_ID;

    const response = await signInWithGoogle();

    expect(response.status).toBe(503);
    expect(mockVerifyGoogleCredential).not.toHaveBeenCalled();
  });

  it('rejects requests without a credential', async () => {
    const response = await request(createApp()).post('/api/member/google').send({});

    expect(response.status).toBe(400);
  });
});

describe('administrator volunteer email authorization', () => {
  const authorize = (teamId, email, token = adminToken) => {
    const req = request(createApp()).put(`/api/admin/members/${teamId}/google`).send({ email });
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  it('requires administrator authentication', async () => {
    const response = await authorize(TEAM_A_ID, 'volunteer@gmail.com', null);

    expect(response.status).toBe(401);
    expect(mockMembers.size).toBe(0);
  });

  it('creates a password-less member account for a profile without one', async () => {
    const response = await authorize(TEAM_A_ID, ' Volunteer@Gmail.com ');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ teamId: TEAM_A_ID, email: 'volunteer@gmail.com', status: 'active' });
    const member = mockMembers.get(MOCK_MEMBER_A_ID);
    expect(member).toMatchObject({ teamId: TEAM_A_ID, email: 'volunteer@gmail.com', username: `member-${TEAM_A_ID}` });
    expect(member.passwordHash).toBeUndefined();
  });

  it('changing an email unbinds the old Google account and ends its sessions', async () => {
    mockMembers.set(MOCK_MEMBER_A_ID, { _id: MOCK_MEMBER_A_ID, teamId: TEAM_A_ID, username: 'member.a', email: 'old@gmail.com', googleSubject: 'old-sub', status: 'active', tokenVersion: 2 });

    const response = await authorize(TEAM_A_ID, 'new@gmail.com');

    expect(response.status).toBe(200);
    expect(mockMembers.get(MOCK_MEMBER_A_ID)).toMatchObject({ email: 'new@gmail.com', tokenVersion: 3 });
    expect(mockMembers.get(MOCK_MEMBER_A_ID).googleSubject).toBeUndefined();
  });

  it('refuses an email already authorized for another profile', async () => {
    mockMembers.set(MOCK_MEMBER_A_ID, { _id: MOCK_MEMBER_A_ID, teamId: TEAM_A_ID, username: 'member.a', email: 'volunteer@gmail.com', status: 'active', tokenVersion: 0 });

    const response = await authorize(TEAM_B_ID, 'volunteer@gmail.com');

    expect(response.status).toBe(409);
  });

  it('rejects invalid emails and unknown profiles', async () => {
    expect((await authorize(TEAM_A_ID, 'not-an-email')).status).toBe(400);
    expect((await authorize('507f1f77bcf86cd799439099', 'volunteer@gmail.com')).status).toBe(404);
    expect((await authorize('not-an-id', 'volunteer@gmail.com')).status).toBe(400);
  });

  it('lists authorized emails and revokes access', async () => {
    mockMembers.set(MOCK_MEMBER_A_ID, { _id: MOCK_MEMBER_A_ID, teamId: TEAM_A_ID, username: 'member.a', email: 'volunteer@gmail.com', googleSubject: 'sub', status: 'active', tokenVersion: 0 });

    const list = await request(createApp()).get('/api/admin/members/google').set('Authorization', `Bearer ${adminToken}`);
    expect(list.body).toEqual([{ teamId: TEAM_A_ID, email: 'volunteer@gmail.com', status: 'active' }]);

    const revoke = await request(createApp()).delete(`/api/admin/members/${TEAM_A_ID}/google`).set('Authorization', `Bearer ${adminToken}`);
    expect(revoke.status).toBe(200);
    expect(mockMembers.get(MOCK_MEMBER_A_ID)).toMatchObject({ tokenVersion: 1 });
    expect(mockMembers.get(MOCK_MEMBER_A_ID).email).toBeUndefined();

    expect((await signInWithGoogle()).status).toBe(403);
  });
});
