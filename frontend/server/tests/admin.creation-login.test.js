const express = require('express');
const request = require('supertest');

const TEST_PASSWORD = 'test-password-never-printed';
const adminRecords = new Map();
const mockAdminModel = {
  exists: jest.fn(async ({ username }) => adminRecords.has(username)),
  create: jest.fn(async (record) => {
    adminRecords.set(record.username, record);
    return record;
  }),
  findOne: jest.fn(async ({ username }) => adminRecords.get(username) || null),
};

jest.mock('../models/Admin', () => mockAdminModel);
jest.mock('../models/Event', () => ({}));
jest.mock('../models/Team', () => ({}));
jest.mock('../config/cloudinary', () => ({ storage: {} }));
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
}));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'admin-login-regression-secret-with-enough-length';
process.env.MONGODB_URI = '';

const { createAdmin } = require('../scripts/create-admin');
const adminRoutes = require('../routes/admin');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  return app;
};

describe('administrator provisioning and login contract', () => {
  beforeEach(() => {
    adminRecords.clear();
    jest.clearAllMocks();
  });

  it('logs in with an administrator created by the provisioning workflow', async () => {
    await createAdmin({
      username: ' ieee_test_admin ',
      password: TEST_PASSWORD,
      mongoUri: 'mongodb://test-db.invalid/ieee-test',
      AdminModel: mockAdminModel,
      connect: jest.fn(),
      disconnect: jest.fn(),
    });

    const response = await request(createApp())
      .post('/api/admin/login')
      .send({ username: 'ieee_test_admin', password: TEST_PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(mockAdminModel.findOne).toHaveBeenCalledWith({ username: 'ieee_test_admin' });
  });

  it('rejects an incorrect password for an administrator created by the workflow', async () => {
    await createAdmin({
      username: 'ieee_test_admin',
      password: TEST_PASSWORD,
      mongoUri: 'mongodb://test-db.invalid/ieee-test',
      AdminModel: mockAdminModel,
      connect: jest.fn(),
      disconnect: jest.fn(),
    });

    const response = await request(createApp())
      .post('/api/admin/login')
      .send({ username: 'ieee_test_admin', password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid credentials' });
  });
});
