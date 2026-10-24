const express = require('express');
const request = require('supertest');
const { createAdminToken } = require('../services/admin-auth');

const mockAdminFindOne = jest.fn();
const mockTeamFindById = jest.fn();
const mockMemberFindOne = jest.fn();
const mockMemberCreate = jest.fn();

jest.mock('../models/Admin', () => ({ findOne: (...args) => mockAdminFindOne(...args) }));
jest.mock('../models/Event', () => ({}));
jest.mock('../models/Team', () => ({ findById: (...args) => mockTeamFindById(...args) }));
jest.mock('../models/Member', () => ({
  findOne: (...args) => mockMemberFindOne(...args),
  create: (...args) => mockMemberCreate(...args),
}));
jest.mock('../config/cloudinary', () => ({ storage: {}, certificateStorage: {} }));
jest.mock('express-rate-limit', () => () => (req, res, next) => next());

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'member-provisioning-test-secret-with-enough-length';

const adminRoutes = require('../routes/admin');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  return app;
};

const adminToken = createAdminToken({ username: 'administrator' }, process.env.JWT_SECRET);
const teamId = '507f1f77bcf86cd799439011';

beforeEach(() => {
  jest.clearAllMocks();
  mockTeamFindById.mockResolvedValue({ _id: teamId, name: 'Approved member' });
  mockMemberFindOne.mockResolvedValue(null);
  mockMemberCreate.mockImplementation(async (record) => ({ _id: '507f1f77bcf86cd799439012', ...record }));
});

describe('administrator-controlled member account provisioning', () => {
  it('does not allow anonymous account provisioning', async () => {
    const response = await request(createApp()).post('/api/admin/members/provision').send({
      username: 'member.a',
      teamId,
    });
    expect(response.status).toBe(401);
    expect(mockMemberCreate).not.toHaveBeenCalled();
  });

  it('links a pending account to an existing Team and returns a one-time activation secret once', async () => {
    const response = await request(createApp())
      .post('/api/admin/members/provision')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'Member.A', teamId });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      member: {
        id: '507f1f77bcf86cd799439012',
        username: 'member.a',
        status: 'pending',
        teamId,
      },
      activationToken: expect.any(String),
    });
    expect(response.body.member.passwordHash).toBeUndefined();
    expect(mockMemberCreate).toHaveBeenCalledWith(expect.objectContaining({
      teamId,
      username: 'member.a',
      status: 'pending',
      activationTokenHash: expect.any(String),
      activationExpiresAt: expect.any(Date),
    }));
    expect(mockMemberCreate.mock.calls[0][0].activationTokenHash).not.toBe(response.body.activationToken);
  });

  it('returns conflict when an account or team link already exists', async () => {
    mockMemberFindOne.mockResolvedValue({ _id: 'existing' });
    const response = await request(createApp())
      .post('/api/admin/members/provision')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'member.a', teamId });
    expect(response.status).toBe(409);
    expect(mockMemberCreate).not.toHaveBeenCalled();
  });

  it('rejects invalid or unknown Team identifiers before account creation', async () => {
    const invalid = await request(createApp())
      .post('/api/admin/members/provision')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'member.a', teamId: 'not-an-id' });
    expect(invalid.status).toBe(400);
    expect(mockTeamFindById).not.toHaveBeenCalled();

    mockTeamFindById.mockResolvedValue(null);
    const missing = await request(createApp())
      .post('/api/admin/members/provision')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'member.a', teamId });
    expect(missing.status).toBe(404);
    expect(mockMemberCreate).not.toHaveBeenCalled();
  });
});
